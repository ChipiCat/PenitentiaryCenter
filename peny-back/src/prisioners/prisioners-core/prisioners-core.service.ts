/**
 * Tipo extendido de Request para incluir currentUser cacheado
 */
type RequestWithCurrentUser = Request & {
  currentUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

/**
 * Interfaz para los metadatos de auditoría extraídos del request
 */
export interface AuditMetadata {
  ipAddress?: string;
  userAgent?: string;
}
import { PrismaService } from '../../prisma/prisma.service';
import {
  Prisoner,
  PrisonerStatus,
  PrisonerIdentity,
  PrisonerPersonal,
  PrisonerPenitentiary,
  MedicalRecord,
  PrisonerBelonging,
  PrisonerContact,
  PrisonerChild,
  File,
  Prisma,
  AuditAction,
  AuditModule,
  EntityType,
} from '../../../generated/prisma';
import {
  CreatePrisonerDTO,
  UpdatePrisonerDto,
  PrisonerResponseDTO,
  PrisonerListQueryDto,
  PrisonerListResponseDto,
} from './dto/prisoner.dto';
import { CompletePrisonerProfileDto } from './dto/full-prisoner.dto';
import { PaginationMetaDto } from '../../common/interfaces/entity.interface';
import { IdentityResponseDto } from '../prisoner-identity/dto/identity.dto';
import { PersonalResponseDto } from '../prisoner-personal/dto/personal.dto';
import { PenitentiaryResponseDto } from '../prisoner-penitentiary/dto/penitentiary.dto';
import { MedicalRecordResponseDto } from '../prisoner-medical-record/dto/medical-record.dto';
import { BelongingResponseDto } from '../prisoner-belonging/dto/belonging.dto';
import { ContactResponseDto } from '../prisoner-contact/dto/contact.dto';
import { ChildResponseDto } from '../prisoner-children/dto/childre.dto';
import { FileResponseDto } from 'src/files/dto/file.dto';
import { AuditService } from '../../audit/audit.service';
import { Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class PrisionersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  /**
   * Extraer metadatos de auditoría del request
   */
  private getAuditMetadata(): AuditMetadata {
    // El tipo Request no incluye auditMetadata, así que extendemos el tipo aquí
    const auditMetadata = (
      this.request as Request & { auditMetadata?: AuditMetadata }
    ).auditMetadata;
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
    // Cache en el request para evitar múltiples consultas
    const req = this.request as RequestWithCurrentUser;
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
      // Cachear en el request
      (this.request as RequestWithCurrentUser).currentUser = user;
    }

    return user;
  }

  /**
   * Crea un nuevo prisionero
   */
  async create(
    createDto: CreatePrisonerDTO,
    userId: string,
  ): Promise<PrisonerResponseDTO> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    // Verificar que el número de registro no exista
    const existing = await this.prisma.prisoner.findFirst({
      where: { registrationNumber: createDto.registration_number },
    });

    if (existing) {
      throw new BadRequestException(
        `Prisoner with registration number ${createDto.registration_number} already exists`,
      );
    }

    const prisoner = await this.prisma.prisoner.create({
      data: {
        registrationNumber: createDto.registration_number,
        admissionDate: new Date(createDto.admission_date),
        fiscalFileNumber: createDto.fiscal_file_number,
        status: (createDto.status as PrisonerStatus) || PrisonerStatus.Activo,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Log prisoner registration
    await this.auditService.logEntityCreated(
      AuditAction.PRISONER_REGISTERED,
      EntityType.PRISONER,
      prisoner.id,
      `Prisoner ${prisoner.registrationNumber} registered`,
      userId,
      AuditModule.PRISONERS,
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
      prisoner.id, // prisonerRelatedId
    );

    return this.mapToResponseDto(prisoner);
  }

  /**
   * Lista prisioneros con paginación y filtros
   */
  async findAll(query: PrisonerListQueryDto): Promise<PrisonerListResponseDto> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Construir filtros dinámicos
    const where: Prisma.PrisonerWhereInput = {
      isDeleted: false,
    };

    if (query.status) {
      where.status = query.status as PrisonerStatus;
    }

    if (query.search) {
      where.OR = [
        { registrationNumber: { contains: query.search, mode: 'insensitive' } },
        { fiscalFileNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Ejecutar query con paginación
    const [prisoners, total] = await Promise.all([
      this.prisma.prisoner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.prisoner.count({ where }),
    ]);

    const data = prisoners.map((p) => this.mapToResponseDto(p));
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationMetaDto = {
      page,
      limit,
      total,
      totalPages,
    };

    return new PrisonerListResponseDto(data, pagination);
  }

  /**
   * Obtiene un prisionero por ID
   */
  async findOne(id: string): Promise<PrisonerResponseDTO> {
    const prisoner = await this.prisma.prisoner.findFirst({
      where: { id },
    });

    if (!prisoner || prisoner.isDeleted) {
      throw new NotFoundException(`Prisoner with ID ${id} not found`);
    }

    return this.mapToResponseDto(prisoner);
  }

  /**
   * Actualiza un prisionero
   */
  async update(
    id: string,
    updateDto: UpdatePrisonerDto,
    userId: string,
  ): Promise<PrisonerResponseDTO> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    // Verificar que existe
    const existing = await this.prisma.prisoner.findFirst({
      where: { id },
    });

    if (!existing || existing.isDeleted) {
      throw new NotFoundException(`Prisoner with ID ${id} not found`);
    }

    // Si se actualiza el número de registro, verificar unicidad
    if (
      updateDto.registration_number &&
      updateDto.registration_number !== existing.registrationNumber
    ) {
      const duplicate = await this.prisma.prisoner.findFirst({
        where: { registrationNumber: updateDto.registration_number },
      });

      if (duplicate) {
        throw new BadRequestException(
          `Prisoner with registration number ${updateDto.registration_number} already exists`,
        );
      }
    }

    const prisoner = await this.prisma.prisoner.update({
      where: { id },
      data: {
        registrationNumber: updateDto.registration_number,
        fiscalFileNumber: updateDto.fiscal_file_number,
        status: updateDto.status as PrisonerStatus,
        updatedBy: userId,
      },
    });

    // Build field changes for audit
    const fieldChanges: Array<{
      field_name: string;
      old_value?: string;
      new_value?: string;
    }> = [];

    if (
      updateDto.registration_number &&
      updateDto.registration_number !== existing.registrationNumber
    ) {
      fieldChanges.push({
        field_name: 'registration_number',
        old_value: existing.registrationNumber,
        new_value: updateDto.registration_number,
      });
    }

    if (
      updateDto.fiscal_file_number !== undefined &&
      updateDto.fiscal_file_number !== existing.fiscalFileNumber
    ) {
      fieldChanges.push({
        field_name: 'fiscal_file_number',
        old_value: existing.fiscalFileNumber || 'null',
        new_value: updateDto.fiscal_file_number || 'null',
      });
    }

    if (updateDto.status && updateDto.status !== existing.status) {
      fieldChanges.push({
        field_name: 'status',
        old_value: existing.status,
        new_value: updateDto.status,
      });
    }

    // Log update if there are changes
    if (fieldChanges.length > 0) {
      await this.auditService.logEntityUpdated(
        AuditAction.UPDATE,
        EntityType.PRISONER,
        prisoner.id,
        `Prisoner ${prisoner.registrationNumber} updated`,
        userId,
        AuditModule.PRISONERS,
        fieldChanges,
        userInfo?.email,
        userInfo?.name,
        userInfo?.role,
        ipAddress,
        userAgent,
        prisoner.id, // prisonerRelatedId
      );
    }

    return this.mapToResponseDto(prisoner);
  }

  /**
   * Elimina un prisionero (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    const existing = await this.prisma.prisoner.findFirst({
      where: { id },
    });

    if (!existing || existing.isDeleted) {
      throw new NotFoundException(`Prisoner with ID ${id} not found`);
    }

    await this.prisma.prisoner.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedBy: userId,
      },
    });

    // Log deletion
    await this.auditService.logEntityDeleted(
      AuditAction.DELETE,
      EntityType.PRISONER,
      existing.id,
      `Prisoner ${existing.registrationNumber} deleted`,
      userId,
      AuditModule.PRISONERS,
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
      existing.id, // prisonerRelatedId
    );
  }

  /**
   * Obtiene el perfil completo de un prisionero
   * Incluye toda la información relacionada en una sola llamada
   */
  async getCompleteProfile(
    prisonerId: string,
  ): Promise<CompletePrisonerProfileDto> {
    // Verificar que el prisionero existe
    const prisoner = await this.prisma.prisoner.findUnique({
      where: { id: prisonerId },
      include: {
        identity: {
          include: {
            photoFile: true,
            rightFingerprint: true,
            leftFingerprint: true,
          },
        },
        personal: true,
        penitentiary: true,
        medicalRecords: {
          where: { isDeleted: false },
          include: { file: true },
          orderBy: { examinationDate: 'desc' },
        },
        belongings: {
          where: { isDeleted: false },
          include: { inventoryFile: true },
          orderBy: { createdAt: 'desc' },
        },
        contacts: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
        },
        children: {
          where: { isDeleted: false },
          orderBy: { birthDate: 'desc' },
        },
      },
    });

    if (!prisoner || prisoner.isDeleted) {
      throw new NotFoundException(`Prisoner with ID ${prisonerId} not found`);
    }

    // Construir el perfil completo
    return {
      prisoner: this.mapToResponseDto(prisoner),
      identity: prisoner.identity
        ? this.mapIdentityToDto(prisoner.identity)
        : undefined,
      personal: prisoner.personal
        ? this.mapPersonalToDto(prisoner.personal)
        : undefined,
      penitentiary: prisoner.penitentiary
        ? this.mapPenitentiaryToDto(prisoner.penitentiary)
        : undefined,
      medical_records: prisoner.medicalRecords.map((record) =>
        this.mapMedicalRecordToDto(record),
      ),
      belongings: prisoner.belongings.map((belonging) =>
        this.mapBelongingToDto(belonging),
      ),
      contacts: prisoner.contacts.map((contact) =>
        this.mapContactToDto(contact),
      ),
      children: prisoner.children.map((child) => this.mapChildToDto(child)),
    };
  }

  /**
   * Mapper de Prisma model a DTO
   */
  private mapToResponseDto(prisoner: Prisoner): PrisonerResponseDTO {
    return {
      id: prisoner.id,
      registration_number: prisoner.registrationNumber,
      admission_date: prisoner.admissionDate.toISOString(),
      fiscal_file_number: prisoner.fiscalFileNumber || undefined,
      status: prisoner.status,
      isDeleted: prisoner.isDeleted,
      created_by: prisoner.createdBy || '',
      updated_by: prisoner.updatedBy || '',
      created_at: prisoner.createdAt.toISOString(),
      updated_at: prisoner.updatedAt.toISOString(),
    };
  }

  // Mappers privados para entidades relacionadas
  private mapIdentityToDto(
    identity: PrisonerIdentity & {
      photoFile?: File | null;
      rightFingerprint?: File | null;
      leftFingerprint?: File | null;
    },
  ): IdentityResponseDto {
    return {
      id: identity.id,
      prisoner_id: identity.prisonerId,
      photo_file_id: identity.photoFileId ?? undefined,
      right_fingerprint_file_id: identity.rightFingerprintFileId ?? undefined,
      left_fingerprint_file_id: identity.leftFingerprintFileId ?? undefined,
      surname: identity.surname,
      first_name: identity.firstName,
      birth_date: identity.birthDate
        ? identity.birthDate.toISOString()
        : undefined,
      birth_place: identity.birthPlace ?? undefined,
      residence: identity.residence ?? undefined,
      citizenship_type: identity.citizenshipType ?? undefined,
      country_of_origin: identity.countryOfOrigin ?? undefined,
      nationality_type: identity.nationalityType ?? undefined,
      nationality: identity.nationality ?? undefined,
      photo_file:
        identity.photoFile == null
          ? undefined
          : this.mapFileToDto(identity.photoFile),
      right_fingerprint:
        identity.rightFingerprint == null
          ? undefined
          : this.mapFileToDto(identity.rightFingerprint),
      left_fingerprint:
        identity.leftFingerprint == null
          ? undefined
          : this.mapFileToDto(identity.leftFingerprint),
      isDeleted: identity.isDeleted,
      created_by: identity.createdBy ?? '',
      updated_by: identity.updatedBy ?? '',
      created_at: identity.createdAt.toISOString(),
      updated_at: identity.updatedAt.toISOString(),
    };
  }

  private mapPersonalToDto(personal: PrisonerPersonal): PersonalResponseDto {
    return {
      id: personal.id,
      prisoner_id: personal.prisonerId,
      gender: personal.gender ?? undefined,
      father_name: personal.fatherName ?? undefined,
      mother_name: personal.motherName ?? undefined,
      education_level: personal.educationLevel ?? undefined,
      occupation: personal.occupation ?? undefined,
      languages: personal.languages ?? undefined,
      marital_status: personal.maritalStatus ?? undefined,
      id_document_type: personal.idDocumentType ?? undefined,
      id_document_number: personal.idDocumentNumber ?? undefined,
      created_by: personal.createdBy ?? '',
      updated_by: personal.updatedBy ?? '',
      created_at: personal.createdAt.toISOString(),
      updated_at: personal.updatedAt.toISOString(),
    };
  }

  private mapPenitentiaryToDto(
    penitentiary: PrisonerPenitentiary,
  ): PenitentiaryResponseDto {
    return {
      id: penitentiary.id,
      prisoner_id: penitentiary.prisonerId,
      category: penitentiary.category ?? undefined,
      building_number: penitentiary.buildingNumber ?? undefined,
      cell_number: penitentiary.cellNumber ?? undefined,
      bed_number: penitentiary.bedNumber ?? undefined,
      created_by: penitentiary.createdBy ?? '',
      updated_by: penitentiary.updatedBy ?? '',
      created_at: penitentiary.createdAt.toISOString(),
      updated_at: penitentiary.updatedAt.toISOString(),
    };
  }

  private mapMedicalRecordToDto(
    record: MedicalRecord & { file?: File | null },
  ): MedicalRecordResponseDto {
    return {
      id: record.id,
      prisoner_id: record.prisonerId,
      doctor_name: record.doctorName ?? undefined,
      examination_date: record.examinationDate
        ? record.examinationDate.toISOString()
        : undefined,
      reference_number: record.referenceNumber ?? undefined,
      file_id: record.fileId ?? undefined,
      notes: record.notes ?? undefined,
      file: record.file == null ? undefined : this.mapFileToDto(record.file),
      created_by: record.createdBy ?? '',
      updated_by: record.updatedBy ?? '',
      created_at: record.createdAt.toISOString(),
      updated_at: record.updatedAt.toISOString(),
    };
  }

  private mapBelongingToDto(
    belonging: PrisonerBelonging & { inventoryFile?: File | null },
  ): BelongingResponseDto {
    return {
      id: belonging.id,
      prisoner_id: belonging.prisonerId,
      description: belonging.description,
      quantity: belonging.quantity,
      condition: belonging.condition ?? undefined,
      returned: belonging.returned,
      file_id: belonging.inventoryFileId ?? undefined,
      file:
        belonging.inventoryFile == null
          ? undefined
          : this.mapFileToDto(belonging.inventoryFile),
      created_by: belonging.createdBy ?? '',
      updated_by: belonging.updatedBy ?? '',
      created_at: belonging.createdAt.toISOString(),
      updated_at: belonging.updatedAt.toISOString(),
    };
  }

  private mapContactToDto(contact: PrisonerContact): ContactResponseDto {
    return {
      id: contact.id,
      prisoner_id: contact.prisonerId,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      created_by: contact.createdBy ?? '',
      updated_by: contact.updatedBy ?? '',
      created_at: contact.createdAt.toISOString(),
      updated_at: contact.updatedAt.toISOString(),
    };
  }

  private mapChildToDto(child: PrisonerChild): ChildResponseDto {
    return {
      id: child.id,
      prisoner_id: child.prisonerId,
      full_name: child.fullName,
      birth_date: child.birthDate ? child.birthDate.toISOString() : undefined,
      created_by: child.createdBy ?? '',
      updated_by: child.updatedBy ?? '',
      created_at: child.createdAt.toISOString(),
      updated_at: child.updatedAt.toISOString(),
    };
  }

  private mapFileToDto(file: File): FileResponseDto {
    return {
      id: file.id,
      url: file.url,
      storagePath: file.storagePath || undefined,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      extension: file.extension,
      size: file.size,
      storageType: file.storageType,
      entityType: file.entityType,
      entityId: file.entityId,
      fieldName: file.fieldName,
      createdBy: file.createdBy,
      createdAt: file.createdAt.toISOString(),
    };
  }
}
