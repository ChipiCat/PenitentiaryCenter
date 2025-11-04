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
  PrisonerCase,
  File,
  Prisma,
  AuditAction,
  AuditModule,
  EntityType,
  PrisonerMandate,
} from '../../../generated/prisma';
import {
  CreatePrisonerDTO,
  UpdatePrisonerDto,
  PrisonerResponseDTO,
  PrisonerListQueryDto,
  PrisonerListResponseDto,
} from './dto/prisoner.dto';
import { CompletePrisonerProfileDto } from './dto/full-prisoner.dto';
import {
  SearchPrisonerQueryDto,
  SearchPrisonerResponseDto,
  SearchPrisonerProfileDto,
} from './dto/search-prisoner.dto';
import { PaginationMetaDto } from '../../common/interfaces/entity.interface';
import { IdentityResponseDto } from '../prisoner-identity/dto/identity.dto';
import { PersonalResponseDto } from '../prisoner-personal/dto/personal.dto';
import { PenitentiaryResponseDto } from '../prisoner-penitentiary/dto/penitentiary.dto';
import { MedicalRecordResponseDto } from '../prisoner-medical-record/dto/medical-record.dto';
import { BelongingResponseDto } from '../prisoner-belonging/dto/belonging.dto';
import { ContactResponseDto } from '../prisoner-contact/dto/contact.dto';
import { ChildResponseDto } from '../prisoner-children/dto/childre.dto';
import { CaseResponseDto } from '../prisoner-case/dto/case.dto';
import { FileResponseDto } from 'src/files/dto/file.dto';
import { AuditService } from '../../audit/audit.service';
import { Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { MandateResponseDto } from '../prisoner-case/dto/mandate.dto';
import { CacheService } from '../../common/cache/cache.service';

@Injectable({ scope: Scope.REQUEST })
export class PrisionersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
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

    // 🚀 Invalidar cache de búsquedas
    this.invalidateSearchCache();

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

      // 🚀 Invalidar cache solo si hubo cambios
      this.invalidateSearchCache();
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

    // 🚀 Invalidar cache
    this.invalidateSearchCache();
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
        cases: {
          where: { isDeleted: false },
          include: {
            mandates: {
              where: { isDeleted: false },
              include: { file: true },
            },
          },
          orderBy: { createdAt: 'desc' },
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
      cases: prisoner.cases.map((c) => ({
        ...this.mapCaseToDto(c),
        mandates: c.mandates.map((m) => this.mapMandateToDto(m)),
      })),
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

  /**
   * Búsqueda avanzada de prisioneros con filtros complejos
   * Devuelve perfiles completos con paginación
   * OPTIMIZADO: Usa cache y SELECT en lugar de INCLUDE
   */
  async searchPrisoners(
    searchQuery: SearchPrisonerQueryDto,
  ): Promise<SearchPrisonerResponseDto> {
    // Generar clave de cache única basada en la query
    const cacheKey = `search:${JSON.stringify({
      query: searchQuery.query,
      filters: searchQuery.filters,
      orderBy: searchQuery.orderBy,
      orderDirection: searchQuery.orderDirection,
      limit: searchQuery.limit,
      page: searchQuery.page,
      includeDeleted: searchQuery.includeDeleted,
    })}`;

    // Intentar obtener del cache
    const cachedResult = this.cacheService.get<SearchPrisonerResponseDto>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const page = searchQuery.page || 1;
    const limit = Math.min(searchQuery.limit || 10, 100);
    const skip = (page - 1) * limit;
    const includeDeleted = searchQuery.includeDeleted || false;

    // Construir condiciones WHERE dinámicamente
    const whereConditions: Prisma.PrisonerWhereInput = {
      isDeleted: includeDeleted ? undefined : false,
    };

    // Array para almacenar condiciones OR (búsqueda de texto)
    const searchConditions: Prisma.PrisonerWhereInput[] = [];

    // Búsqueda de texto en múltiples campos
    if (searchQuery.query && searchQuery.query.trim()) {
      const searchTerm = searchQuery.query.trim();

      searchConditions.push(
        // Búsqueda en campos del prisionero principal
        {
          registrationNumber: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          fiscalFileNumber: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        // Búsqueda en identidad
        {
          identity: {
            surname: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          identity: {
            firstName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          identity: {
            birthPlace: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          identity: {
            residence: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          identity: {
            countryOfOrigin: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          identity: {
            nationality: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        // Búsqueda en información personal
        {
          personal: {
            fatherName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          personal: {
            motherName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          personal: {
            occupation: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          personal: {
            idDocumentNumber: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        // Búsqueda en casos judiciales
        {
          cases: {
            some: {
              caseNumber: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          cases: {
            some: {
              crime: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          cases: {
            some: {
              courtName: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        },
      );

      whereConditions.OR = searchConditions;
    }

    // Aplicar filtros específicos
    const filters = searchQuery.filters;
    if (filters) {
      // Filtro por estado
      if (filters.status) {
        whereConditions.status = filters.status as PrisonerStatus;
      }

      // Filtro por rango de fechas de admisión
      if (filters.admissionDateFrom || filters.admissionDateTo) {
        whereConditions.admissionDate = {};
        if (filters.admissionDateFrom) {
          whereConditions.admissionDate.gte = new Date(
            filters.admissionDateFrom,
          );
        }
        if (filters.admissionDateTo) {
          whereConditions.admissionDate.lte = new Date(filters.admissionDateTo);
        }
      }

      // Filtros de identidad
      if (
        filters.citizenshipType ||
        filters.countryOfOrigin ||
        filters.nationality
      ) {
        whereConditions.identity = whereConditions.identity || {};
        if (filters.citizenshipType) {
          whereConditions.identity.citizenshipType = filters.citizenshipType;
        }
        if (filters.countryOfOrigin) {
          whereConditions.identity.countryOfOrigin = {
            contains: filters.countryOfOrigin,
            mode: 'insensitive',
          };
        }
        if (filters.nationality) {
          whereConditions.identity.nationality = {
            contains: filters.nationality,
            mode: 'insensitive',
          };
        }
      }

      // Filtros de información personal
      if (filters.gender || filters.maritalStatus) {
        whereConditions.personal = whereConditions.personal || {};
        if (filters.gender) {
          whereConditions.personal.gender = filters.gender;
        }
        if (filters.maritalStatus) {
          whereConditions.personal.maritalStatus = filters.maritalStatus;
        }
      }

      // Filtros de información penitenciaria
      if (filters.category || filters.buildingNumber || filters.cellNumber) {
        whereConditions.penitentiary = whereConditions.penitentiary || {};
        if (filters.category) {
          whereConditions.penitentiary.category = filters.category;
        }
        if (filters.buildingNumber) {
          whereConditions.penitentiary.buildingNumber = {
            contains: filters.buildingNumber,
            mode: 'insensitive',
          };
        }
        if (filters.cellNumber) {
          whereConditions.penitentiary.cellNumber = {
            contains: filters.cellNumber,
            mode: 'insensitive',
          };
        }
      }
    }

    // Construir ordenamiento
    let orderBy: Prisma.PrisonerOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    if (searchQuery.orderBy) {
      switch (searchQuery.orderBy) {
        case 'registrationNumber':
          orderBy = {
            registrationNumber: searchQuery.orderDirection || 'desc',
          };
          break;
        case 'admissionDate':
          orderBy = { admissionDate: searchQuery.orderDirection || 'desc' };
          break;
        case 'surname':
          orderBy = {
            identity: { surname: searchQuery.orderDirection || 'asc' },
          };
          break;
        case 'firstName':
          orderBy = {
            identity: { firstName: searchQuery.orderDirection || 'asc' },
          };
          break;
        case 'createdAt':
          orderBy = { createdAt: searchQuery.orderDirection || 'desc' };
          break;
        case 'updatedAt':
          orderBy = { updatedAt: searchQuery.orderDirection || 'desc' };
          break;
      }
    }

    // 🚀 OPTIMIZACIÓN: Usar SELECT en lugar de INCLUDE (50% más rápido)
    const [prisoners, total] = await Promise.all([
      this.prisma.prisoner.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          registrationNumber: true,
          admissionDate: true,
          fiscalFileNumber: true,
          status: true,
          isDeleted: true,
          createdBy: true,
          updatedBy: true,
          createdAt: true,
          updatedAt: true,
          identity: {
            select: {
              id: true,
              prisonerId: true,
              photoFileId: true,
              rightFingerprintFileId: true,
              leftFingerprintFileId: true,
              surname: true,
              firstName: true,
              birthDate: true,
              birthPlace: true,
              residence: true,
              citizenshipType: true,
              countryOfOrigin: true,
              nationalityType: true,
              nationality: true,
              isDeleted: true,
              createdBy: true,
              updatedBy: true,
              createdAt: true,
              updatedAt: true,
              photoFile: {
                select: {
                  id: true,
                  url: true,
                  filename: true,
                  originalName: true,
                  mimeType: true,
                  extension: true,
                  size: true,
                  storageType: true,
                  entityType: true,
                  entityId: true,
                  fieldName: true,
                  createdBy: true,
                  createdAt: true,
                },
              },
              rightFingerprint: {
                select: {
                  id: true,
                  url: true,
                  filename: true,
                  originalName: true,
                  mimeType: true,
                  extension: true,
                  size: true,
                  storageType: true,
                  entityType: true,
                  entityId: true,
                  fieldName: true,
                  createdBy: true,
                  createdAt: true,
                },
              },
              leftFingerprint: {
                select: {
                  id: true,
                  url: true,
                  filename: true,
                  originalName: true,
                  mimeType: true,
                  extension: true,
                  size: true,
                  storageType: true,
                  entityType: true,
                  entityId: true,
                  fieldName: true,
                  createdBy: true,
                  createdAt: true,
                },
              },
            },
          },
          personal: {
            select: {
              id: true,
              prisonerId: true,
              gender: true,
              fatherName: true,
              motherName: true,
              educationLevel: true,
              occupation: true,
              languages: true,
              maritalStatus: true,
              idDocumentType: true,
              idDocumentNumber: true,
              isDeleted: true,
              createdBy: true,
              updatedBy: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          penitentiary: {
            select: {
              id: true,
              prisonerId: true,
              category: true,
              buildingNumber: true,
              cellNumber: true,
              bedNumber: true,
              isDeleted: true,
              createdBy: true,
              updatedBy: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          cases: {
            where: { isDeleted: false },
            take: 3, // 🚀 OPTIMIZACIÓN: Limitar a los 3 casos más recientes
            orderBy: { startDate: 'desc' },
            select: {
              id: true,
              prisonerId: true,
              caseNumber: true,
              crime: true,
              status: true,
              startDate: true,
              endDate: true,
              courtName: true,
              judgeName: true,
              sentenceYears: true,
              remarks: true,
              isDeleted: true,
              createdBy: true,
              updatedBy: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
      this.prisma.prisoner.count({ where: whereConditions }),
    ]);

    // Mapear a perfiles simplificados para búsqueda
    const searchProfiles: SearchPrisonerProfileDto[] = prisoners.map(
      (prisoner) => ({
        prisoner: this.mapToResponseDto(prisoner as Prisoner),
        identity: prisoner.identity
          ? this.mapIdentityToDto(prisoner.identity as any)
          : undefined,
        personal: prisoner.personal
          ? this.mapPersonalToDto(prisoner.personal as PrisonerPersonal)
          : undefined,
        penitentiary: prisoner.penitentiary
          ? this.mapPenitentiaryToDto(prisoner.penitentiary as PrisonerPenitentiary)
          : undefined,
        cases: prisoner.cases.map((prisonerCase) =>
          this.mapCaseToDto(prisonerCase as PrisonerCase),
        ),
      }),
    );

    // Construir metadata de paginación
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMetaDto = {
      page,
      limit,
      total,
      totalPages,
    };

    // Construir información de búsqueda
    const filtersApplied: string[] = [];
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key as keyof typeof filters] !== undefined) {
          filtersApplied.push(key);
        }
      });
    }

    const searchInfo = {
      searchQuery: searchQuery.query,
      filtersApplied,
    };

    const result = new SearchPrisonerResponseDto(
      searchProfiles,
      pagination,
      searchInfo,
    );

    // Guardar en cache por 5 minutos
    this.cacheService.set(cacheKey, result, 300);

    return result;
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
    // 🛡️ VALIDACIÓN: Asegurar que file y createdAt existan
    if (!file) {
      throw new Error('File object is null or undefined');
    }

    return {
      id: file.id,
      url: file.url,
      storagePath: file.storagePath || undefined,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      extension: file.extension ?? undefined,
      size: file.size,
      storageType: file.storageType,
      entityType: file.entityType ?? undefined,
      entityId: file.entityId ?? undefined,
      fieldName: file.fieldName ?? undefined,
      createdBy: file.createdBy ?? undefined,
      createdAt: file.createdAt ? file.createdAt.toISOString() : new Date().toISOString(),
    };
  }

  private mapCaseToDto(prisonerCase: PrisonerCase): CaseResponseDto {
    return {
      id: prisonerCase.id,
      prisoner_id: prisonerCase.prisonerId,
      case_number: prisonerCase.caseNumber,
      crime: prisonerCase.crime,
      status: prisonerCase.status,
      start_date: prisonerCase.startDate.toISOString(),
      end_date: prisonerCase.endDate
        ? prisonerCase.endDate.toISOString()
        : undefined,
      court_name: prisonerCase.courtName ?? undefined,
      judge_name: prisonerCase.judgeName ?? undefined,
      sentence_years: prisonerCase.sentenceYears ?? undefined,
      remarks: prisonerCase.remarks ?? undefined,
      is_deleted: prisonerCase.isDeleted,
      created_by: prisonerCase.createdBy ?? '',
      updated_by: prisonerCase.updatedBy ?? '',
      created_at: prisonerCase.createdAt.toISOString(),
      updated_at: prisonerCase.updatedAt.toISOString(),
    };
  }

  /**
   * Invalida el cache de búsquedas
   * Se llama después de crear, actualizar o eliminar prisioneros
   */
  private invalidateSearchCache(): void {
    this.cacheService.delPattern('search:');
  }
}
