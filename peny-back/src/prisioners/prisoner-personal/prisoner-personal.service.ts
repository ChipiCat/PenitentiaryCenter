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
import { CreatePersonalDto, PersonalResponseDto } from './dto/personal.dto';
import {
  PrisonerPersonal,
  AuditAction,
  AuditModule,
  EntityType,
} from '../../../generated/prisma';

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
export class PrisonerPersonalService {
  private readonly logger = new Logger(PrisonerPersonalService.name);

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
   * Crea información personal de un prisionero
   */
  async create(
    prisonerId: string,
    createDto: CreatePersonalDto,
    userId: string,
  ): Promise<PersonalResponseDto> {
    try {
      this.logger.log(`Creating personal info for prisoner: ${prisonerId}`);
      const { ipAddress, userAgent } = this.getAuditMetadata();
      const userInfo = await this.getUserInfo(userId);

      // Verificar que el prisionero existe
      const prisoner = await this.prisma.prisoner.findFirst({
        where: { id: prisonerId, isDeleted: false },
      });

      if (!prisoner) {
        throw new NotFoundException(`Prisoner with ID ${prisonerId} not found`);
      }

      // Verificar que no exista información personal previa
      const existing = await this.prisma.prisonerPersonal.findFirst({
        where: { prisonerId, isDeleted: false },
      });

      if (existing) {
        throw new BadRequestException(
          `Personal information already exists for prisoner ${prisonerId}. Use PUT to update.`,
        );
      }

      // Crear información personal
      const personal = await this.prisma.prisonerPersonal.create({
        data: {
          prisonerId,
          gender: createDto.gender,
          fatherName: createDto.father_name,
          motherName: createDto.mother_name,
          educationLevel: createDto.education_level,
          occupation: createDto.occupation,
          languages: createDto.languages,
          maritalStatus: createDto.marital_status,
          idDocumentType: createDto.id_document_type,
          idDocumentNumber: createDto.id_document_number,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      // Log audit - creación sin DataChangeLog
      await this.auditService.logEntityCreated(
        AuditAction.CREATE,
        EntityType.PRISONER_PERSONAL,
        personal.id,
        `Información personal creada`,
        userId,
        AuditModule.PERSONAL,
        userInfo?.email,
        userInfo?.name,
        userInfo?.role,
        ipAddress,
        userAgent,
        prisonerId, // prisonerRelatedId
      );

      this.logger.log(`Personal info created successfully: ${personal.id}`);
      return this.mapToResponseDto(personal);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error creating personal info: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error creating personal info', String(error));
      }
      throw error;
    }
  }
  /**
   * Obtiene información personal de un prisionero
   */
  async findOne(prisonerId: string): Promise<PersonalResponseDto> {
    this.logger.log(`Fetching personal info for prisoner: ${prisonerId}`);

    const personal = await this.prisma.prisonerPersonal.findFirst({
      where: { prisonerId, isDeleted: false },
    });

    if (!personal) {
      throw new NotFoundException(
        `Personal information not found for prisoner ${prisonerId}`,
      );
    }

    return this.mapToResponseDto(personal);
  }

  /**
   * Actualiza información personal de un prisionero
   */
  async update(
    prisonerId: string,
    updateDto: CreatePersonalDto,
    userId: string,
  ): Promise<PersonalResponseDto> {
    try {
      this.logger.log(`Updating personal info for prisoner: ${prisonerId}`);
      const { ipAddress, userAgent } = this.getAuditMetadata();
      const userInfo = await this.getUserInfo(userId);

      // Verificar que existe
      const existing = await this.prisma.prisonerPersonal.findFirst({
        where: { prisonerId, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException(
          `Personal information not found for prisoner ${prisonerId}`,
        );
      }

      // Build field changes array
      const fieldChanges: Array<{
        field_name: string;
        old_value?: string;
        new_value?: string;
      }> = [];

      const fields = [
        { dto: 'gender', existing: 'gender', name: 'gender' },
        { dto: 'father_name', existing: 'fatherName', name: 'father_name' },
        { dto: 'mother_name', existing: 'motherName', name: 'mother_name' },
        {
          dto: 'education_level',
          existing: 'educationLevel',
          name: 'education_level',
        },
        { dto: 'occupation', existing: 'occupation', name: 'occupation' },
        { dto: 'languages', existing: 'languages', name: 'languages' },
        {
          dto: 'marital_status',
          existing: 'maritalStatus',
          name: 'marital_status',
        },
        {
          dto: 'id_document_type',
          existing: 'idDocumentType',
          name: 'id_document_type',
        },
        {
          dto: 'id_document_number',
          existing: 'idDocumentNumber',
          name: 'id_document_number',
        },
      ];

      type DtoKeys = keyof CreatePersonalDto;
      type ModelKeys = keyof PrisonerPersonal;

      fields.forEach((field) => {
        // Acceso tipado a los campos del DTO y del modelo
        const dtoKey = field.dto as DtoKeys;
        const modelKey = field.existing as ModelKeys;
        const dtoValue = updateDto[dtoKey];
        const existingValue = existing[modelKey];
        if (dtoValue !== undefined && dtoValue !== existingValue) {
          fieldChanges.push({
            field_name: field.name,
            old_value:
              existingValue !== null && existingValue !== undefined
                ? String(existingValue)
                : 'null',
            new_value:
              dtoValue !== null && dtoValue !== undefined
                ? String(dtoValue)
                : 'null',
          });
        }
      });

      // Actualizar
      const updated = await this.prisma.prisonerPersonal.update({
        where: { prisonerId },
        data: {
          gender: updateDto.gender ?? existing.gender,
          fatherName: updateDto.father_name ?? existing.fatherName,
          motherName: updateDto.mother_name ?? existing.motherName,
          educationLevel: updateDto.education_level ?? existing.educationLevel,
          occupation: updateDto.occupation ?? existing.occupation,
          languages: updateDto.languages ?? existing.languages,
          maritalStatus: updateDto.marital_status ?? existing.maritalStatus,
          idDocumentType: updateDto.id_document_type ?? existing.idDocumentType,
          idDocumentNumber:
            updateDto.id_document_number ?? existing.idDocumentNumber,
          updatedBy: userId,
        },
      });
      Logger.log(`Personal user updated by: ${userId}`);

      // Log audit with field changes
      if (fieldChanges.length > 0) {
        await this.auditService.logEntityUpdated(
          AuditAction.UPDATE,
          EntityType.PRISONER_PERSONAL,
          updated.id,
          `Información personal actualizada`,
          userId,
          AuditModule.PERSONAL,
          fieldChanges,
          userInfo?.email,
          userInfo?.name,
          userInfo?.role,
          ipAddress,
          userAgent,
          prisonerId, // prisonerRelatedId
        );
      }

      this.logger.log(`Personal info updated successfully: ${updated.id}`);
      return this.mapToResponseDto(updated);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error updating personal info: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error updating personal info', String(error));
      }
      throw error;
    }
  }

  /**
   * Mapper de modelo Prisma a DTO
   */
  private mapToResponseDto(personal: PrisonerPersonal): PersonalResponseDto {
    return {
      id: personal.id,
      prisoner_id: personal.prisonerId,
      gender: personal.gender || undefined,
      father_name: personal.fatherName || undefined,
      mother_name: personal.motherName || undefined,
      education_level: personal.educationLevel || undefined,
      occupation: personal.occupation || undefined,
      languages: personal.languages || undefined,
      marital_status: personal.maritalStatus || undefined,
      id_document_type: personal.idDocumentType || undefined,
      id_document_number: personal.idDocumentNumber || undefined,
      created_by: personal.createdBy || '',
      updated_by: personal.updatedBy || '',
      created_at: personal.createdAt.toISOString(),
      updated_at: personal.updatedAt.toISOString(),
    };
  }
}
