import { Injectable, NotFoundException, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { FilesService } from '../../files/files.service';
import { AuditService } from '../../audit/audit.service';
import {
  CreateBelongingDto,
  UpdateBelongingDto,
  BelongingResponseDto,
} from './dto/belonging.dto';
import { File, PrisonerBelonging } from 'generated/prisma';
import { UploadedFile } from '../../files/interfaces/uploaded-file.interface';

@Injectable({ scope: Scope.REQUEST })
export class PrisonerBelongingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
    private readonly auditService: AuditService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  /**
   * Extraer metadatos de auditoría del request
   */
  private getAuditMetadata(): { ipAddress?: string; userAgent?: string } {
    const auditMetadata = (this.request as any).auditMetadata;
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
    const cachedUser = (this.request as any).currentUser;
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
      // Cachear en el request
      (this.request as any).currentUser = user;
    }

    return user;
  }

  /**
   * Crear un nuevo artículo personal
   */
  async create(
    prisonerId: string,
    createDto: CreateBelongingDto,
    userId: string,
  ): Promise<BelongingResponseDto> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);
    
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

    // Log audit
    await this.auditService.logEntityCreated(
      'BELONGING_REGISTERED',
      'PRISONER_BELONGING',
      belonging.id,
      `Artículo personal registrado: ${createDto.description}`,
      userId,
      'BELONGINGS',
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
    );

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
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);
    
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

    // Build field changes array
    const fieldChanges: Array<{
      field_name: string;
      old_value?: string;
      new_value?: string;
    }> = [];

    if (
      updateDto.description !== undefined &&
      updateDto.description !== existingBelonging.description
    ) {
      fieldChanges.push({
        field_name: 'description',
        old_value: existingBelonging.description,
        new_value: updateDto.description,
      });
    }

    if (
      updateDto.quantity !== undefined &&
      updateDto.quantity !== existingBelonging.quantity
    ) {
      fieldChanges.push({
        field_name: 'quantity',
        old_value: existingBelonging.quantity.toString(),
        new_value: updateDto.quantity.toString(),
      });
    }

    if (
      updateDto.condition !== undefined &&
      updateDto.condition !== existingBelonging.condition
    ) {
      fieldChanges.push({
        field_name: 'condition',
        old_value: existingBelonging.condition ?? undefined,
        new_value: updateDto.condition,
      });
    }

    if (
      updateDto.returned !== undefined &&
      updateDto.returned !== existingBelonging.returned
    ) {
      fieldChanges.push({
        field_name: 'returned',
        old_value: existingBelonging.returned.toString(),
        new_value: updateDto.returned.toString(),
      });
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

    // Log audit with field changes
    if (fieldChanges.length > 0) {
      await this.auditService.logEntityUpdated(
        'BELONGING_UPDATED',
        'PRISONER_BELONGING',
        belongingId,
        `Artículo personal actualizado: ${updateDto.description ?? existingBelonging.description}`,
        userId,
        'BELONGINGS',
        fieldChanges,
        userInfo?.email,
        userInfo?.name,
        userInfo?.role,
        ipAddress,
        userAgent,
      );
    }

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
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);
    
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

    // Log audit
    await this.auditService.logEntityDeleted(
      'BELONGING_UPDATED', // Using UPDATED since BELONGING_DELETED doesn't exist in AuditAction enum
      'PRISONER_BELONGING',
      belongingId,
      `Artículo personal eliminado (soft delete): ${existingBelonging.description}`,
      userId,
      'BELONGINGS',
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
    );

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
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);
    
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

    // Log audit
    await this.auditService.logEntityUpdated(
      'BELONGING_RETURNED',
      'PRISONER_BELONGING',
      belongingId,
      `Artículo personal devuelto: ${existingBelonging.description}`,
      userId,
      'BELONGINGS',
      [
        {
          field_name: 'returned',
          old_value: existingBelonging.returned.toString(),
          new_value: 'true',
        },
      ],
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
    );

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
