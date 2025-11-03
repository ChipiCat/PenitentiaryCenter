import { Injectable, NotFoundException, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import {
  CreateCaseDto,
  UpdateCaseDto,
  CaseResponseDto,
  CaseListQueryDto,
} from './dto/case.dto';
import { MandateResponseDto } from './dto/mandate.dto';
import {
  CaseStatus,
  File,
  Prisma,
  PrisonerCase,
  PrisonerMandate,
  AuditAction,
  AuditModule,
  EntityType,
} from '../../../generated/prisma';
import { PaginationMetaDto } from '../../common/interfaces/entity.interface';

/**
 * Interfaz para los metadatos de auditoría extraídos del request
 */
interface AuditMetadata {
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Tipo extendido de Request para incluir metadatos de auditoría y usuario cacheado
 */
type RequestWithAuditData = Request & {
  auditMetadata?: AuditMetadata;
  currentUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

@Injectable({ scope: Scope.REQUEST })
export class PrisonerCaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  /**
   * Extraer metadatos de auditoría del request
   */
  private getAuditMetadata(): AuditMetadata {
    const req = this.request as RequestWithAuditData;
    const auditMetadata = req.auditMetadata;
    return {
      ipAddress: auditMetadata?.ipAddress,
      userAgent: auditMetadata?.userAgent,
    };
  }

  /**
   * Obtener información completa del usuario actual para auditoría
   */
  private async getUserInfo(userId: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
  } | null> {
    const req = this.request as RequestWithAuditData;
    const cachedUser = req.currentUser;
    if (cachedUser && cachedUser.id === userId) {
      return cachedUser;
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (user) {
      req.currentUser = user;
    }

    return user;
  }

  /**
   * Crear un nuevo caso judicial para un prisionero
   */
  async create(
    prisonerId: string,
    createDto: CreateCaseDto,
    userId: string,
  ): Promise<CaseResponseDto> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    // Verificar que el prisionero existe
    const prisoner = await this.prisma.prisoner.findFirst({
      where: { id: prisonerId, isDeleted: false },
    });

    if (!prisoner) {
      throw new NotFoundException(
        `Prisionero con ID ${prisonerId} no encontrado`,
      );
    }

    const prisonerCase = await this.prisma.prisonerCase.create({
      data: {
        prisonerId,
        caseNumber: createDto.case_number,
        crime: createDto.crime,
        status: createDto.status as CaseStatus,
        startDate: new Date(createDto.start_date),
        endDate: createDto.end_date ? new Date(createDto.end_date) : null,
        courtName: createDto.court_name,
        judgeName: createDto.judge_name,
        sentenceYears: createDto.sentence_years,
        remarks: createDto.remarks,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Log audit - creación sin DataChangeLog
    await this.auditService.logEntityCreated(
      AuditAction.CREATE,
      EntityType.PRISONER_CASE,
      prisonerCase.id,
      `Caso judicial creado: ${prisonerCase.caseNumber} - ${prisonerCase.crime}`,
      userId,
      AuditModule.CASES,
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
      prisonerId, // prisonerRelatedId
    );

    return this.mapToResponseDto(prisonerCase);
  }

  /**
   * Listar casos de un prisionero con paginación y filtros
   */
  async findAll(
    prisonerId: string,
    query: CaseListQueryDto,
  ): Promise<{ data: CaseResponseDto[]; pagination: PaginationMetaDto }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PrisonerCaseWhereInput = {
      prisonerId,
      isDeleted: false,
    };

    if (query.status) {
      where.status = query.status as CaseStatus;
    }

    if (query.search) {
      where.OR = [
        { caseNumber: { contains: query.search, mode: 'insensitive' } },
        { crime: { contains: query.search, mode: 'insensitive' } },
        { courtName: { contains: query.search, mode: 'insensitive' } },
        { judgeName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [cases, total] = await Promise.all([
      this.prisma.prisonerCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.prisonerCase.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: cases.map((c) => this.mapToResponseDto(c)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Obtener un caso por ID
   */
  async findOne(caseId: string): Promise<CaseResponseDto> {
    const prisonerCase = await this.prisma.prisonerCase.findFirst({
      where: { id: caseId, isDeleted: false },
    });

    if (!prisonerCase) {
      throw new NotFoundException(`Caso con ID ${caseId} no encontrado`);
    }

    return this.mapToResponseDto(prisonerCase);
  }

  /**
   * Actualizar un caso
   */
  async update(
    caseId: string,
    updateDto: UpdateCaseDto,
    userId: string,
  ): Promise<CaseResponseDto> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    const existing = await this.prisma.prisonerCase.findFirst({
      where: { id: caseId, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Caso con ID ${caseId} no encontrado`);
    }

    // Build field changes array
    const fieldChanges: Array<{
      field_name: string;
      old_value?: string;
      new_value?: string;
    }> = [];

    if (
      updateDto.case_number !== undefined &&
      updateDto.case_number !== existing.caseNumber
    ) {
      fieldChanges.push({
        field_name: 'case_number',
        old_value: existing.caseNumber,
        new_value: updateDto.case_number,
      });
    }

    if (updateDto.crime !== undefined && updateDto.crime !== existing.crime) {
      fieldChanges.push({
        field_name: 'crime',
        old_value: existing.crime,
        new_value: updateDto.crime,
      });
    }

    if (
      updateDto.status !== undefined &&
      updateDto.status !== existing.status
    ) {
      fieldChanges.push({
        field_name: 'status',
        old_value: existing.status,
        new_value: updateDto.status,
      });
    }

    if (updateDto.start_date !== undefined) {
      const newStartDate = new Date(updateDto.start_date).toISOString();
      const oldStartDate = existing.startDate.toISOString();
      if (newStartDate !== oldStartDate) {
        fieldChanges.push({
          field_name: 'start_date',
          old_value: oldStartDate,
          new_value: newStartDate,
        });
      }
    }

    if (updateDto.end_date !== undefined) {
      const newEndDate = updateDto.end_date
        ? new Date(updateDto.end_date).toISOString()
        : null;
      const oldEndDate = existing.endDate?.toISOString() || null;
      if (newEndDate !== oldEndDate) {
        fieldChanges.push({
          field_name: 'end_date',
          old_value: oldEndDate || 'null',
          new_value: newEndDate || 'null',
        });
      }
    }

    if (
      updateDto.court_name !== undefined &&
      updateDto.court_name !== existing.courtName
    ) {
      fieldChanges.push({
        field_name: 'court_name',
        old_value: existing.courtName || 'null',
        new_value: updateDto.court_name || 'null',
      });
    }

    if (
      updateDto.judge_name !== undefined &&
      updateDto.judge_name !== existing.judgeName
    ) {
      fieldChanges.push({
        field_name: 'judge_name',
        old_value: existing.judgeName || 'null',
        new_value: updateDto.judge_name || 'null',
      });
    }

    if (
      updateDto.sentence_years !== undefined &&
      updateDto.sentence_years !== existing.sentenceYears
    ) {
      fieldChanges.push({
        field_name: 'sentence_years',
        old_value: existing.sentenceYears?.toString() || 'null',
        new_value: updateDto.sentence_years?.toString() || 'null',
      });
    }

    if (
      updateDto.remarks !== undefined &&
      updateDto.remarks !== existing.remarks
    ) {
      fieldChanges.push({
        field_name: 'remarks',
        old_value: existing.remarks || 'null',
        new_value: updateDto.remarks || 'null',
      });
    }

    const prisonerCase = await this.prisma.prisonerCase.update({
      where: { id: caseId },
      data: {
        caseNumber: updateDto.case_number,
        crime: updateDto.crime,
        status: updateDto.status as CaseStatus | undefined,
        startDate: updateDto.start_date
          ? new Date(updateDto.start_date)
          : undefined,
        endDate: updateDto.end_date ? new Date(updateDto.end_date) : undefined,
        courtName: updateDto.court_name,
        judgeName: updateDto.judge_name,
        sentenceYears: updateDto.sentence_years,
        remarks: updateDto.remarks,
        updatedBy: userId,
      },
    });

    // Log audit with field changes
    if (fieldChanges.length > 0) {
      await this.auditService.logEntityUpdated(
        AuditAction.UPDATE,
        EntityType.PRISONER_CASE,
        prisonerCase.id,
        `Caso judicial actualizado: ${prisonerCase.caseNumber}`,
        userId,
        AuditModule.CASES,
        fieldChanges,
        userInfo?.email,
        userInfo?.name,
        userInfo?.role,
        ipAddress,
        userAgent,
        existing.prisonerId, // prisonerRelatedId
      );
    }

    return this.mapToResponseDto(prisonerCase);
  }

  /**
   * Eliminar (soft delete) un caso
   */
  async remove(caseId: string, userId: string): Promise<void> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    const existing = await this.prisma.prisonerCase.findFirst({
      where: { id: caseId, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Caso con ID ${caseId} no encontrado`);
    }

    await this.prisma.prisonerCase.update({
      where: { id: caseId },
      data: { isDeleted: true, updatedBy: userId },
    });

    // Log audit
    await this.auditService.logEntityDeleted(
      AuditAction.DELETE,
      EntityType.PRISONER_CASE,
      existing.id,
      `Caso judicial eliminado: ${existing.caseNumber} - ${existing.crime}`,
      userId,
      AuditModule.CASES,
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
      existing.prisonerId, // prisonerRelatedId
    );
  }

  /**
   * Obtener casos completos de un prisionero (con mandatos)
   */
  async getCompleteProfile(prisonerId: string): Promise<{
    cases: Array<CaseResponseDto & { mandates: MandateResponseDto[] }>;
  }> {
    const cases = await this.prisma.prisonerCase.findMany({
      where: { prisonerId, isDeleted: false },
      include: {
        mandates: {
          where: { isDeleted: false },
          include: { file: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      cases: cases.map((c) => ({
        ...this.mapToResponseDto(c),
        mandates: c.mandates.map((m) => this.mapMandateToDto(m)),
      })),
    };
  }

  /**
   * Mapper de modelo Prisma a DTO
   */
  private mapToResponseDto(prisonerCase: PrisonerCase): CaseResponseDto {
    return {
      id: prisonerCase.id,
      prisoner_id: prisonerCase.prisonerId,
      case_number: prisonerCase.caseNumber,
      crime: prisonerCase.crime,
      status: prisonerCase.status,
      start_date: prisonerCase.startDate.toISOString().split('T')[0],
      end_date: prisonerCase.endDate
        ? prisonerCase.endDate.toISOString().split('T')[0]
        : undefined,
      court_name: prisonerCase.courtName || undefined,
      judge_name: prisonerCase.judgeName || undefined,
      sentence_years: prisonerCase.sentenceYears || undefined,
      remarks: prisonerCase.remarks || undefined,
      is_deleted: prisonerCase.isDeleted,
      created_by: prisonerCase.createdBy || '',
      updated_by: prisonerCase.updatedBy || '',
      created_at: prisonerCase.createdAt.toISOString(),
      updated_at: prisonerCase.updatedAt.toISOString(),
    };
  }

  /**
   * Mapper de mandato a DTO (helper para getCompleteProfile)
   */
  public mapMandateToDto(
    mandate: PrisonerMandate & { file?: File | null },
  ): MandateResponseDto {
    return {
      id: mandate.id,
      case_id: mandate.caseId,
      type: mandate.type,
      issue_date: mandate.issueDate.toISOString().split('T')[0],
      file_id: mandate.fileId || undefined,
      file: mandate.file
        ? {
            id: mandate.file.id,
            url: mandate.file.url,
            storagePath: mandate.file.storagePath || undefined,
            filename: mandate.file.filename,
            originalName: mandate.file.originalName,
            mimeType: mandate.file.mimeType,
            extension: mandate.file.extension,
            size: mandate.file.size,
            storageType: mandate.file.storageType,
            entityType: mandate.file.entityType,
            entityId: mandate.file.entityId,
            fieldName: mandate.file.fieldName,
            createdBy: mandate.file.createdBy,
            createdAt: mandate.file.createdAt.toISOString(),
            deletedAt: mandate.file.deletedAt?.toISOString() || undefined,
          }
        : undefined,
      description: mandate.description || undefined,
      status: mandate.status,
      is_deleted: mandate.isDeleted,
      created_by: mandate.createdBy || '',
      updated_by: mandate.updatedBy || '',
      created_at: mandate.createdAt.toISOString(),
      updated_at: mandate.updatedAt.toISOString(),
    };
  }
}
