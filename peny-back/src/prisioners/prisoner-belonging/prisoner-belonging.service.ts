import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilesService } from '../../files/files.service';
import {
  CreateBelongingDto,
  UpdateBelongingDto,
  BelongingResponseDto,
} from './dto/belonging.dto';
import { File, PrisonerBelonging } from 'generated/prisma';
import { UploadedFile } from '../../files/interfaces/uploaded-file.interface';

@Injectable()
export class PrisonerBelongingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  /**
   * Crear un nuevo artículo personal
   */
  async create(
    prisonerId: string,
    createDto: CreateBelongingDto,
    userId: string,
  ): Promise<BelongingResponseDto> {
    // Verificar que el prisionero exista
    const prisoner = await this.prisma.prisoner.findUnique({
      where: { id: prisonerId, isDeleted: false },
    });

    if (!prisoner) {
      throw new NotFoundException(
        `Prisionero con ID ${prisonerId} no encontrado`,
      );
    }

    // Crear el artículo personal
    const belonging = await this.prisma.prisonerBelonging.create({
      data: {
        prisonerId,
        description: createDto.description,
        quantity: createDto.quantity ?? 1,
        condition: createDto.condition,
        returned: createDto.returned ?? false,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        inventoryFile: true,
      },
    });

    return this.mapToResponseDto(belonging);
  }

  /**
   * Listar todos los artículos personales del prisionero
   */
  async findAll(prisonerId: string): Promise<BelongingResponseDto[]> {
    // Verificar que el prisionero exista
    const prisoner = await this.prisma.prisoner.findUnique({
      where: { id: prisonerId, isDeleted: false },
    });

    if (!prisoner) {
      throw new NotFoundException(
        `Prisionero con ID ${prisonerId} no encontrado`,
      );
    }

    const belongings = await this.prisma.prisonerBelonging.findMany({
      where: {
        prisonerId,
        isDeleted: false,
      },
      include: {
        inventoryFile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return belongings.map((belonging) => this.mapToResponseDto(belonging));
  }

  /**
   * Obtener un artículo específico
   */
  async findOne(
    prisonerId: string,
    belongingId: string,
  ): Promise<BelongingResponseDto> {
    const belonging = await this.prisma.prisonerBelonging.findFirst({
      where: {
        id: belongingId,
        prisonerId,
        isDeleted: false,
      },
      include: {
        inventoryFile: true,
      },
    });

    if (!belonging) {
      throw new NotFoundException(
        `Artículo con ID ${belongingId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    return this.mapToResponseDto(belonging);
  }

  /**
   * Actualizar un artículo personal
   */
  async update(
    prisonerId: string,
    belongingId: string,
    updateDto: UpdateBelongingDto,
    userId: string,
  ): Promise<BelongingResponseDto> {
    // Verificar que el artículo exista
    const existingBelonging = await this.prisma.prisonerBelonging.findFirst({
      where: {
        id: belongingId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!existingBelonging) {
      throw new NotFoundException(
        `Artículo con ID ${belongingId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    // Actualizar el artículo
    const updatedBelonging = await this.prisma.prisonerBelonging.update({
      where: { id: belongingId },
      data: {
        description: updateDto.description,
        quantity: updateDto.quantity,
        condition: updateDto.condition,
        returned: updateDto.returned,
        updatedBy: userId,
      },
      include: {
        inventoryFile: true,
      },
    });

    return this.mapToResponseDto(updatedBelonging);
  }

  /**
   * Eliminar (soft delete) un artículo personal
   */
  async delete(
    prisonerId: string,
    belongingId: string,
    userId: string,
  ): Promise<{ message: string }> {
    // Verificar que el artículo exista
    const existingBelonging = await this.prisma.prisonerBelonging.findFirst({
      where: {
        id: belongingId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!existingBelonging) {
      throw new NotFoundException(
        `Artículo con ID ${belongingId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    // Soft delete
    await this.prisma.prisonerBelonging.update({
      where: { id: belongingId },
      data: {
        isDeleted: true,
        updatedBy: userId,
      },
    });

    // Si tiene archivo asociado, marcarlo como eliminado
    if (existingBelonging.inventoryFileId) {
      await this.filesService.deleteFile(existingBelonging.inventoryFileId);
    }

    return { message: 'Artículo personal eliminado exitosamente' };
  }

  /**
   * Subir archivo de inventario (PDF)
   */
  async uploadFile(
    prisonerId: string,
    belongingId: string,
    file: UploadedFile,
    userId: string,
  ): Promise<BelongingResponseDto> {
    // Verificar que el artículo exista
    const existingBelonging = await this.prisma.prisonerBelonging.findFirst({
      where: {
        id: belongingId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!existingBelonging) {
      throw new NotFoundException(
        `Artículo con ID ${belongingId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    // Si ya tiene archivo, eliminar el anterior
    if (existingBelonging.inventoryFileId) {
      await this.filesService.deleteFile(existingBelonging.inventoryFileId);
    }

    // Subir el nuevo archivo
    const uploadedFile = await this.filesService.uploadFile(
      file,
      'belonging',
      belongingId,
      'inventory',
      userId,
    );

    // Actualizar el artículo con el inventoryFileId
    const updatedBelonging = await this.prisma.prisonerBelonging.update({
      where: { id: belongingId },
      data: {
        inventoryFileId: uploadedFile.id,
        updatedBy: userId,
      },
      include: {
        inventoryFile: true,
      },
    });

    return this.mapToResponseDto(updatedBelonging);
  }

  /**
   * Marcar un artículo como devuelto
   */
  async markAsReturned(
    prisonerId: string,
    belongingId: string,
    userId: string,
  ): Promise<BelongingResponseDto> {
    // Verificar que el artículo exista
    const existingBelonging = await this.prisma.prisonerBelonging.findFirst({
      where: {
        id: belongingId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!existingBelonging) {
      throw new NotFoundException(
        `Artículo con ID ${belongingId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    // Marcar como devuelto
    const updatedBelonging = await this.prisma.prisonerBelonging.update({
      where: { id: belongingId },
      data: {
        returned: true,
        updatedBy: userId,
      },
      include: {
        inventoryFile: true,
      },
    });

    return this.mapToResponseDto(updatedBelonging);
  }

  /**
   * Mapear entidad Prisma a DTO de respuesta
   */
  private mapToResponseDto(
    belonging: PrisonerBelonging & { inventoryFile: File | null },
  ): BelongingResponseDto {
    return {
      id: belonging.id,
      prisoner_id: belonging.prisonerId,
      description: belonging.description,
      quantity: belonging.quantity,
      condition: belonging.condition ?? '',
      returned: belonging.returned,
      file_id: belonging.inventoryFileId ?? undefined,
      file: belonging.inventoryFile
        ? {
            id: belonging.inventoryFile.id,
            url: belonging.inventoryFile.url,
            storagePath: belonging.inventoryFile.storagePath ?? '',
            filename: belonging.inventoryFile.filename,
            originalName: belonging.inventoryFile.originalName,
            mimeType: belonging.inventoryFile.mimeType,
            extension: belonging.inventoryFile.extension ?? '',
            size: belonging.inventoryFile.size,
            storageType: belonging.inventoryFile.storageType,
            entityType: belonging.inventoryFile.entityType,
            entityId: belonging.inventoryFile.entityId,
            fieldName: belonging.inventoryFile.fieldName,
            createdBy: belonging.inventoryFile.createdBy,
            createdAt: belonging.inventoryFile.createdAt.toISOString(),
            deletedAt: belonging.inventoryFile.deletedAt
              ? belonging.inventoryFile.deletedAt.toISOString()
              : undefined,
          }
        : undefined,
      created_by: belonging.createdBy ?? '',
      updated_by: belonging.updatedBy ?? '',
      created_at: belonging.createdAt.toISOString(),
      updated_at: belonging.updatedAt.toISOString(),
    };
  }
}
