import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
} from '../../../generated/prisma';
import { PaginationMetaDto } from '../../common/interfaces/entity.interface';

@Injectable()
export class PrisonerCaseService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo caso judicial para un prisionero
   */
  async create(
    prisonerId: string,
    createDto: CreateCaseDto,
    userId: string,
  ): Promise<CaseResponseDto> {
    // Verificar que el prisionero existe
    const prisoner = await this.prisma.prisoner.findUnique({
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
    const prisonerCase = await this.prisma.prisonerCase.findUnique({
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
    const existing = await this.prisma.prisonerCase.findUnique({
      where: { id: caseId, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Caso con ID ${caseId} no encontrado`);
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

    return this.mapToResponseDto(prisonerCase);
  }

  /**
   * Eliminar (soft delete) un caso
   */
  async remove(caseId: string): Promise<void> {
    const existing = await this.prisma.prisonerCase.findUnique({
      where: { id: caseId, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Caso con ID ${caseId} no encontrado`);
    }

    await this.prisma.prisonerCase.update({
      where: { id: caseId },
      data: { isDeleted: true },
    });
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
  private mapMandateToDto(
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
