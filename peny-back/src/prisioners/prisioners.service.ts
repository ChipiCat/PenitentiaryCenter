import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisoner, PrisonerStatus } from '../../generated/prisma';
import {
  CreatePrisonerDTO,
  UpdatePrisonerDto,
  PrisonerResponseDTO,
  PrisonerListQueryDto,
  PrisonerListResponseDto,
} from './dto/prisoner.dto';
import { PaginationMetaDto } from '../common/interfaces/entity.interface';

@Injectable()
export class PrisionersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo prisionero
   */
  async create(
    createDto: CreatePrisonerDTO,
    userId: string,
  ): Promise<PrisonerResponseDTO> {
    // Verificar que el número de registro no exista
    const existing = await this.prisma.prisoner.findUnique({
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
        status: createDto.status as PrisonerStatus || PrisonerStatus.Activo,
        createdBy: userId,
        updatedBy: userId,
      },
    });

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
    const where: any = {
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
    const prisoner = await this.prisma.prisoner.findUnique({
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
    // Verificar que existe
    const existing = await this.prisma.prisoner.findUnique({
      where: { id },
    });

    if (!existing || existing.isDeleted) {
      throw new NotFoundException(`Prisoner with ID ${id} not found`);
    }

    // Si se actualiza el número de registro, verificar unicidad
    if (updateDto.registration_number && updateDto.registration_number !== existing.registrationNumber) {
      const duplicate = await this.prisma.prisoner.findUnique({
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

    return this.mapToResponseDto(prisoner);
  }

  /**
   * Elimina un prisionero (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.prisma.prisoner.findUnique({
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
}
