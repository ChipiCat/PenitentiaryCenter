import { Injectable, NotFoundException, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import {
  CreateChildDto,
  UpdateChildDto,
  ChildResponseDto,
} from './dto/childre.dto';
import {
  PrisonerChild,
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
export class PrisonerChildrenService {
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
   * Agregar información de un hijo
   */
  async create(
    prisonerId: string,
    createDto: CreateChildDto,
    userId: string,
  ): Promise<ChildResponseDto> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    // Verificar que el prisionero exista
    const prisoner = await this.prisma.prisoner.findFirst({
      where: { id: prisonerId, isDeleted: false },
    });

    if (!prisoner) {
      throw new NotFoundException(
        `Prisionero con ID ${prisonerId} no encontrado`,
      );
    }

    // Crear el registro del hijo
    const child = await this.prisma.prisonerChild.create({
      data: {
        prisonerId,
        fullName: createDto.full_name,
        birthDate: createDto.birth_date ? new Date(createDto.birth_date) : null,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Log audit - creación sin DataChangeLog
    await this.auditService.logEntityCreated(
      AuditAction.CREATE,
      EntityType.PRISONER_CHILD,
      child.id,
      `Hijo registrado: ${child.fullName}`,
      userId,
      AuditModule.CHILDREN,
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
      prisonerId, // prisonerRelatedId
    );

    return this.mapToResponseDto(child);
  }

  /**
   * Listar todos los hijos del prisionero
   */
  async findAll(prisonerId: string): Promise<ChildResponseDto[]> {
    // Verificar que el prisionero exista
    const prisoner = await this.prisma.prisoner.findUnique({
      where: { id: prisonerId, isDeleted: false },
    });

    if (!prisoner) {
      throw new NotFoundException(
        `Prisionero con ID ${prisonerId} no encontrado`,
      );
    }

    const children = await this.prisma.prisonerChild.findMany({
      where: {
        prisonerId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return children.map((child) => this.mapToResponseDto(child));
  }

  /**
   * Obtener información de un hijo específico
   */
  async findOne(
    prisonerId: string,
    childId: string,
  ): Promise<ChildResponseDto> {
    const child = await this.prisma.prisonerChild.findFirst({
      where: {
        id: childId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!child) {
      throw new NotFoundException(
        `Hijo con ID ${childId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    return this.mapToResponseDto(child);
  }

  /**
   * Actualizar información de un hijo
   */
  async update(
    prisonerId: string,
    childId: string,
    updateDto: UpdateChildDto,
    userId: string,
  ): Promise<ChildResponseDto> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    // Verificar que el registro exista
    const existingChild = await this.prisma.prisonerChild.findFirst({
      where: {
        id: childId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!existingChild) {
      throw new NotFoundException(
        `Hijo con ID ${childId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    // Build field changes array
    const fieldChanges: Array<{
      field_name: string;
      old_value?: string;
      new_value?: string;
    }> = [];

    if (
      updateDto.full_name !== undefined &&
      updateDto.full_name !== existingChild.fullName
    ) {
      fieldChanges.push({
        field_name: 'full_name',
        old_value: existingChild.fullName,
        new_value: updateDto.full_name,
      });
    }

    if (updateDto.birth_date !== undefined) {
      const newBirthDate = updateDto.birth_date
        ? new Date(updateDto.birth_date).toISOString()
        : null;
      const oldBirthDate = existingChild.birthDate?.toISOString() || null;
      if (newBirthDate !== oldBirthDate) {
        fieldChanges.push({
          field_name: 'birth_date',
          old_value: oldBirthDate || 'null',
          new_value: newBirthDate || 'null',
        });
      }
    }

    // Actualizar el registro
    const updatedChild = await this.prisma.prisonerChild.update({
      where: { id: childId },
      data: {
        fullName: updateDto.full_name,
        birthDate: updateDto.birth_date
          ? new Date(updateDto.birth_date)
          : undefined,
        updatedBy: userId,
      },
    });

    // Log audit with field changes
    if (fieldChanges.length > 0) {
      await this.auditService.logEntityUpdated(
        AuditAction.UPDATE,
        EntityType.PRISONER_CHILD,
        updatedChild.id,
        `Hijo actualizado: ${updatedChild.fullName}`,
        userId,
        AuditModule.CHILDREN,
        fieldChanges,
        userInfo?.email,
        userInfo?.name,
        userInfo?.role,
        ipAddress,
        userAgent,
        prisonerId, // prisonerRelatedId
      );
    }

    return this.mapToResponseDto(updatedChild);
  }

  /**
   * Eliminar (soft delete) registro de un hijo
   */
  async delete(
    prisonerId: string,
    childId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    // Verificar que el registro exista
    const existingChild = await this.prisma.prisonerChild.findFirst({
      where: {
        id: childId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!existingChild) {
      throw new NotFoundException(
        `Hijo con ID ${childId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    // Soft delete
    await this.prisma.prisonerChild.update({
      where: { id: childId },
      data: {
        isDeleted: true,
        updatedBy: userId,
      },
    });

    // Log audit
    await this.auditService.logEntityDeleted(
      AuditAction.DELETE,
      EntityType.PRISONER_CHILD,
      existingChild.id,
      `Hijo eliminado: ${existingChild.fullName}`,
      userId,
      AuditModule.CHILDREN,
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
      prisonerId, // prisonerRelatedId
    );

    return { message: 'Registro de hijo eliminado exitosamente' };
  }

  /**
   * Mapear entidad Prisma a DTO de respuesta
   */
  private mapToResponseDto(child: PrisonerChild): ChildResponseDto {
    return {
      id: child.id,
      prisoner_id: child.prisonerId,
      full_name: child.fullName,
      birth_date: child.birthDate
        ? child.birthDate.toISOString().split('T')[0]
        : undefined,
      created_by: child.createdBy ?? '',
      updated_by: child.updatedBy ?? '',
      created_at: child.createdAt.toISOString(),
      updated_at: child.updatedAt.toISOString(),
    };
  }
}
