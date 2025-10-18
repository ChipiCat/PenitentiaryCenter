import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePersonalDto, PersonalResponseDto } from './dto/personal.dto';
import { PrisonerPersonal } from '../../../generated/prisma';

@Injectable()
export class PrisonerPersonalService {
  private readonly logger = new Logger(PrisonerPersonalService.name);

  constructor(private readonly prisma: PrismaService) {}

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

      // Verificar que el prisionero existe
      const prisoner = await this.prisma.prisoner.findUnique({
        where: { id: prisonerId, isDeleted: false },
      });

      if (!prisoner) {
        throw new NotFoundException(`Prisoner with ID ${prisonerId} not found`);
      }

      // Verificar que no exista información personal previa
      const existing = await this.prisma.prisonerPersonal.findUnique({
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

    const personal = await this.prisma.prisonerPersonal.findUnique({
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

      // Verificar que existe
      const existing = await this.prisma.prisonerPersonal.findUnique({
        where: { prisonerId, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException(
          `Personal information not found for prisoner ${prisonerId}`,
        );
      }

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
