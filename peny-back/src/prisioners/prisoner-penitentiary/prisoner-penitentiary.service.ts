import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  Inject,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import {
  CreatePenitentiaryDto,
  PenitentiaryResponseDto,
} from './dto/penitentiary.dto';
import {
  PrisonerPenitentiary,
  AuditAction,
  AuditModule,
  EntityType,
} from 'generated/prisma';

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
export class PrisonerPenitentiaryService {
  private readonly logger = new Logger(PrisonerPenitentiaryService.name);

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

    const user = await this.prisma.user.findUnique({
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
   * Crea información penitenciaria de un prisionero
   */
  async create(
    prisonerId: string,
    createDto: CreatePenitentiaryDto,
    userId: string,
  ): Promise<PenitentiaryResponseDto> {
    try {
      this.logger.log(`Creating penitentiary info for prisoner: ${prisonerId}`);
      const { ipAddress, userAgent } = this.getAuditMetadata();
      const userInfo = await this.getUserInfo(userId);

      // Verificar que el prisionero existe
      const prisoner = await this.prisma.prisoner.findUnique({
        where: { id: prisonerId, isDeleted: false },
      });

      if (!prisoner) {
        throw new NotFoundException(`Prisoner with ID ${prisonerId} not found`);
      }

      // Verificar que no exista información penitenciaria previa
      const existing = await this.prisma.prisonerPenitentiary.findUnique({
        where: { prisonerId, isDeleted: false },
      });

      if (existing) {
        throw new BadRequestException(
          `Penitentiary information already exists for prisoner ${prisonerId}. Use PUT to update.`,
        );
      }

      // Crear información penitenciaria
      const penitentiary = await this.prisma.prisonerPenitentiary.create({
        data: {
          prisonerId,
          category: createDto.category,
          buildingNumber: createDto.building_number,
          cellNumber: createDto.cell_number,
          bedNumber: createDto.bed_number,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      // Log audit - creación sin DataChangeLog
      await this.auditService.logEntityCreated(
        AuditAction.CREATE,
        EntityType.PRISONER_PENITENTIARY,
        penitentiary.id,
        `Información penitenciaria creada: Edificio ${penitentiary.buildingNumber || 'N/A'}, Celda ${penitentiary.cellNumber || 'N/A'}`,
        userId,
        AuditModule.PENITENTIARY,
        userInfo?.email,
        userInfo?.name,
        userInfo?.role,
        ipAddress,
        userAgent,
        prisonerId, // prisonerRelatedId
      );

      this.logger.log(
        `Penitentiary info created successfully: ${penitentiary.id}`,
      );
      return this.mapToResponseDto(penitentiary);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error creating penitentiary info: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error creating penitentiary info', String(error));
      }
      throw error;
    }
  }

  /**
   * Obtiene información penitenciaria de un prisionero
   */
  async findOne(prisonerId: string): Promise<PenitentiaryResponseDto> {
    this.logger.log(`Fetching penitentiary info for prisoner: ${prisonerId}`);

    const penitentiary = await this.prisma.prisonerPenitentiary.findUnique({
      where: { prisonerId, isDeleted: false },
    });

    if (!penitentiary) {
      throw new NotFoundException(
        `Penitentiary information not found for prisoner ${prisonerId}`,
      );
    }

    return this.mapToResponseDto(penitentiary);
  }

  /**
   * Actualiza información penitenciaria de un prisionero
   */
  async update(
    prisonerId: string,
    updateDto: CreatePenitentiaryDto,
    userId: string,
  ): Promise<PenitentiaryResponseDto> {
    try {
      this.logger.log(`Updating penitentiary info for prisoner: ${prisonerId}`);
      const { ipAddress, userAgent } = this.getAuditMetadata();
      const userInfo = await this.getUserInfo(userId);

      // Verificar que existe
      const existing = await this.prisma.prisonerPenitentiary.findUnique({
        where: { prisonerId, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException(
          `Penitentiary information not found for prisoner ${prisonerId}`,
        );
      }

      // Build field changes array
      const fieldChanges: Array<{
        field_name: string;
        old_value?: string;
        new_value?: string;
      }> = [];

      if (
        updateDto.category !== undefined &&
        updateDto.category !== existing.category
      ) {
        fieldChanges.push({
          field_name: 'category',
          old_value: existing.category || 'null',
          new_value: updateDto.category || 'null',
        });
      }

      if (
        updateDto.building_number !== undefined &&
        updateDto.building_number !== existing.buildingNumber
      ) {
        fieldChanges.push({
          field_name: 'building_number',
          old_value: existing.buildingNumber || 'null',
          new_value: updateDto.building_number || 'null',
        });
      }

      if (
        updateDto.cell_number !== undefined &&
        updateDto.cell_number !== existing.cellNumber
      ) {
        fieldChanges.push({
          field_name: 'cell_number',
          old_value: existing.cellNumber || 'null',
          new_value: updateDto.cell_number || 'null',
        });
      }

      if (
        updateDto.bed_number !== undefined &&
        updateDto.bed_number !== existing.bedNumber
      ) {
        fieldChanges.push({
          field_name: 'bed_number',
          old_value: existing.bedNumber || 'null',
          new_value: updateDto.bed_number || 'null',
        });
      }

      // Actualizar
      const updated = await this.prisma.prisonerPenitentiary.update({
        where: { prisonerId },
        data: {
          category: updateDto.category ?? existing.category,
          buildingNumber: updateDto.building_number ?? existing.buildingNumber,
          cellNumber: updateDto.cell_number ?? existing.cellNumber,
          bedNumber: updateDto.bed_number ?? existing.bedNumber,
          updatedBy: userId,
        },
      });

      // Log audit with field changes
      if (fieldChanges.length > 0) {
        await this.auditService.logEntityUpdated(
          AuditAction.UPDATE,
          EntityType.PRISONER_PENITENTIARY,
          updated.id,
          `Información penitenciaria actualizada: Edificio ${updated.buildingNumber || 'N/A'}, Celda ${updated.cellNumber || 'N/A'}`,
          userId,
          AuditModule.PENITENTIARY,
          fieldChanges,
          userInfo?.email,
          userInfo?.name,
          userInfo?.role,
          ipAddress,
          userAgent,
          prisonerId, // prisonerRelatedId
        );
      }

      this.logger.log(`Penitentiary info updated successfully: ${updated.id}`);
      return this.mapToResponseDto(updated);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error updating penitentiary info: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error updating penitentiary info', String(error));
      }
      throw error;
    }
  }

  /**
   * Mapper de modelo Prisma a DTO
   */
  private mapToResponseDto(
    penitentiary: PrisonerPenitentiary,
  ): PenitentiaryResponseDto {
    return {
      id: penitentiary.id,
      prisoner_id: penitentiary.prisonerId,
      category: penitentiary.category || undefined,
      building_number: penitentiary.buildingNumber || undefined,
      cell_number: penitentiary.cellNumber || undefined,
      bed_number: penitentiary.bedNumber || undefined,
      created_by: penitentiary.createdBy || '',
      updated_by: penitentiary.updatedBy || '',
      created_at: penitentiary.createdAt.toISOString(),
      updated_at: penitentiary.updatedAt.toISOString(),
    };
  }
}
