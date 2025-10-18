import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilesService } from '../../files/files.service';
import {
  CreateIdentityDto,
  IdentityResponseDto,
  UpdateIdentityDto,
} from './dto/identity.dto';
import {
  CitizenshipType,
  File,
  Prisma,
  PrisonerIdentity,
} from '../../../generated/prisma';

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  /**
   * Crea información de identidad para un prisionero
   */
  async create(
    prisonerId: string,
    createDto: CreateIdentityDto,
    userId: string,
  ): Promise<IdentityResponseDto> {
    // Verificar que el prisionero existe
    const prisoner = await this.prisma.prisoner.findUnique({
      where: { id: prisonerId, isDeleted: false },
    });

    if (!prisoner) {
      throw new NotFoundException(`Prisoner with ID ${prisonerId} not found`);
    }

    // Verificar que no exista ya una identidad
    const existing = await this.prisma.prisonerIdentity.findUnique({
      where: { prisonerId },
    });

    if (existing) {
      throw new BadRequestException(
        'Identity already exists for this prisoner',
      );
    }

    const identity = await this.prisma.prisonerIdentity.create({
      data: {
        prisonerId,
        surname: createDto.surname,
        firstName: createDto.first_name,
        birthDate: createDto.birth_date ? new Date(createDto.birth_date) : null,
        birthPlace: createDto.birth_place,
        residence: createDto.residence,
        citizenshipType: createDto.citizenship_type as CitizenshipType,
        countryOfOrigin: createDto.country_of_origin,
        nationalityType: createDto.nationality_type,
        nationality: createDto.nationality,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        photoFile: true,
        rightFingerprint: true,
        leftFingerprint: true,
      },
    });

    return this.mapToResponseDto(identity);
  }

  /**
   * Obtiene información de identidad de un prisionero
   */
  async findOne(prisonerId: string): Promise<IdentityResponseDto> {
    const identity = await this.prisma.prisonerIdentity.findUnique({
      where: { prisonerId, isDeleted: false },
      include: {
        photoFile: true,
        rightFingerprint: true,
        leftFingerprint: true,
      },
    });

    if (!identity) {
      throw new NotFoundException(
        `Identity not found for prisoner ${prisonerId}`,
      );
    }

    return this.mapToResponseDto(identity);
  }

  /**
   * Actualiza información de identidad
   */
  async update(
    prisonerId: string,
    updateDto: UpdateIdentityDto,
    userId: string,
  ): Promise<IdentityResponseDto> {
    const existing = await this.prisma.prisonerIdentity.findUnique({
      where: { prisonerId, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(
        `Identity not found for prisoner ${prisonerId}`,
      );
    }

    const identity = await this.prisma.prisonerIdentity.update({
      where: { prisonerId },
      data: {
        surname: updateDto.surname,
        firstName: updateDto.first_name,
        birthDate: updateDto.birth_date
          ? new Date(updateDto.birth_date)
          : undefined,
        birthPlace: updateDto.birth_place,
        residence: updateDto.residence,
        citizenshipType: updateDto.citizenship_type as CitizenshipType,
        countryOfOrigin: updateDto.country_of_origin,
        nationalityType: updateDto.nationality_type,
        nationality: updateDto.nationality,
        updatedBy: userId,
      },
      include: {
        photoFile: true,
        rightFingerprint: true,
        leftFingerprint: true,
      },
    });

    return this.mapToResponseDto(identity);
  }

  /**
   * Sube la foto del prisionero
   */
  async uploadPhoto(
    prisonerId: string,
    file: any,
    userId: string,
  ): Promise<IdentityResponseDto> {
    // Verificar que la identidad existe
    const identity = await this.prisma.prisonerIdentity.findUnique({
      where: { prisonerId, isDeleted: false },
    });

    if (!identity) {
      throw new NotFoundException(
        `Identity not found for prisoner ${prisonerId}`,
      );
    }

    // Subir el archivo
    const fileRecord = await this.filesService.uploadFile(
      file,
      'prisoner_identity',
      prisonerId,
      'photo',
      userId,
    );

    // Si existía una foto anterior, eliminarla
    if (identity.photoFileId) {
      await this.filesService.deleteFile(identity.photoFileId);
    }

    // Actualizar la identidad con el nuevo file
    const updated = await this.prisma.prisonerIdentity.update({
      where: { prisonerId },
      data: {
        photoFileId: fileRecord.id,
        updatedBy: userId,
      },
      include: {
        photoFile: true,
        rightFingerprint: true,
        leftFingerprint: true,
      },
    });

    return this.mapToResponseDto(updated);
  }

  /**
   * Sube huella dactilar (derecha o izquierda)
   */
  async uploadFingerprint(
    prisonerId: string,
    file: any,
    hand: 'right' | 'left',
    userId: string,
  ): Promise<IdentityResponseDto> {
    // Verificar que la identidad existe
    const identity = await this.prisma.prisonerIdentity.findUnique({
      where: { prisonerId, isDeleted: false },
    });

    if (!identity) {
      throw new NotFoundException(
        `Identity not found for prisoner ${prisonerId}`,
      );
    }

    // Subir el archivo
    const fieldName =
      hand === 'right' ? 'right_fingerprint' : 'left_fingerprint';
    const fileRecord = await this.filesService.uploadFile(
      file,
      'prisoner_identity',
      prisonerId,
      fieldName,
      userId,
    );

    // Si existía una huella anterior, eliminarla
    const oldFileId =
      hand === 'right'
        ? identity.rightFingerprintFileId
        : identity.leftFingerprintFileId;
    if (oldFileId) {
      await this.filesService.deleteFile(oldFileId);
    }

    // Actualizar la identidad con el nuevo file
    const updateData: Prisma.PrisonerIdentityUpdateInput = {
      updatedBy: userId,
    };
    if (hand === 'right') {
      updateData.rightFingerprint = { connect: { id: fileRecord.id } };
    } else {
      updateData.leftFingerprint = { connect: { id: fileRecord.id } };
    }

    const updated = await this.prisma.prisonerIdentity.update({
      where: { prisonerId },
      data: updateData,
      include: {
        photoFile: true,
        rightFingerprint: true,
        leftFingerprint: true,
      },
    });

    return this.mapToResponseDto(updated);
  }

  /**
   * Mapper de modelo Prisma a DTO
   */
  private mapToResponseDto(
    identity: PrisonerIdentity & {
      photoFile?: File | null;
      rightFingerprint?: File | null;
      leftFingerprint?: File | null;
    },
  ): IdentityResponseDto {
    return {
      id: identity.id,
      prisoner_id: identity.prisonerId,
      photo_file_id: identity.photoFileId || undefined,
      photo_file: identity.photoFile
        ? {
            id: identity.photoFile.id,
            url: identity.photoFile.url,
            storagePath: identity.photoFile.storagePath || undefined,
            filename: identity.photoFile.fieldName,
            originalName: identity.photoFile.originalName,
            mimeType: identity.photoFile.mimeType,
            extension: identity.photoFile.originalName
              ? (identity.photoFile.originalName.split('.').pop() ?? '')
              : '',
            size: identity.photoFile.size,
            storageType: identity.photoFile.storageType,
            entityType: identity.photoFile.entityType,
            entityId: identity.photoFile.entityId,
            fieldName: identity.photoFile.fieldName,
            createdBy: identity.photoFile.createdBy || '',
            createdAt: identity.photoFile.createdAt.toISOString(),
            deletedAt: identity.photoFile.deletedAt?.toISOString() || undefined,
          }
        : undefined,
      right_fingerprint_file_id: identity.rightFingerprintFileId || undefined,
      right_fingerprint: identity.rightFingerprint
        ? {
            id: identity.rightFingerprint.id,
            url: identity.rightFingerprint.url,
            storagePath: identity.rightFingerprint.storagePath || undefined,
            filename: identity.rightFingerprint.fieldName,
            originalName: identity.rightFingerprint.originalName,
            mimeType: identity.rightFingerprint.mimeType,
            extension: identity.rightFingerprint.originalName
              ? (identity.rightFingerprint.originalName.split('.').pop() ?? '')
              : '',
            size: identity.rightFingerprint.size,
            storageType: identity.rightFingerprint.storageType,
            entityType: identity.rightFingerprint.entityType,
            entityId: identity.rightFingerprint.entityId,
            fieldName: identity.rightFingerprint.fieldName,
            createdBy: identity.rightFingerprint.createdBy || '',
            createdAt: identity.rightFingerprint.createdAt.toISOString(),
            deletedAt:
              identity.rightFingerprint.deletedAt?.toISOString() || undefined,
          }
        : undefined,
      left_fingerprint_file_id: identity.leftFingerprintFileId || undefined,
      left_fingerprint:
        identity.leftFingerprint == null
          ? undefined
          : {
              id: identity.leftFingerprint.id,
              url: identity.leftFingerprint.url,
              storagePath: identity.leftFingerprint.storagePath || undefined,
              filename: identity.leftFingerprint.fieldName,
              originalName: identity.leftFingerprint.originalName,
              mimeType: identity.leftFingerprint.mimeType,
              extension: identity.leftFingerprint.originalName
                ? (identity.leftFingerprint.originalName.split('.').pop() ?? '')
                : '',
              size: identity.leftFingerprint.size,
              storageType: identity.leftFingerprint.storageType,
              entityType: identity.leftFingerprint.entityType,
              entityId: identity.leftFingerprint.entityId,
              fieldName: identity.leftFingerprint.fieldName,
              createdBy: identity.leftFingerprint.createdBy || '',
              createdAt: identity.leftFingerprint.createdAt.toISOString(),
              deletedAt:
                identity.leftFingerprint.deletedAt?.toISOString() || undefined,
            },
      surname: identity.surname,
      first_name: identity.firstName,
      birth_date: identity.birthDate
        ? identity.birthDate.toISOString().split('T')[0]
        : undefined,
      birth_place: identity.birthPlace || undefined,
      residence: identity.residence || undefined,
      citizenship_type: identity.citizenshipType || undefined,
      country_of_origin: identity.countryOfOrigin || undefined,
      nationality_type: identity.nationalityType || undefined,
      nationality: identity.nationality || undefined,
      isDeleted: identity.isDeleted,
      created_by: identity.createdBy || '',
      updated_by: identity.updatedBy || '',
      created_at: identity.createdAt.toISOString(),
      updated_at: identity.updatedAt.toISOString(),
    };
  }
}
