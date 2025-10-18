import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePenitentiaryDto, PenitentiaryResponseDto } from './dto/penitentiary.dto';

@Injectable()
export class PrisonerPenitentiaryService {
  private readonly logger = new Logger(PrisonerPenitentiaryService.name);

  constructor(private readonly prisma: PrismaService) {}

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

      this.logger.log(`Penitentiary info created successfully: ${penitentiary.id}`);
      return this.mapToResponseDto(penitentiary);
    } catch (error) {
      this.logger.error(`Error creating penitentiary info: ${error.message}`, error.stack);
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

      // Verificar que existe
      const existing = await this.prisma.prisonerPenitentiary.findUnique({
        where: { prisonerId, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException(
          `Penitentiary information not found for prisoner ${prisonerId}`,
        );
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

      this.logger.log(`Penitentiary info updated successfully: ${updated.id}`);
      return this.mapToResponseDto(updated);
    } catch (error) {
      this.logger.error(`Error updating penitentiary info: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mapper de modelo Prisma a DTO
   */
  private mapToResponseDto(penitentiary: any): PenitentiaryResponseDto {
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
