import { Injectable, NotFoundException, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactResponseDto,
} from './dto/contact.dto';
import {
  PrisonerContact,
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
export class PrisonerContactService {
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
      req.currentUser = user;
    }

    return user;
  }

  /**
   * Agregar un contacto de emergencia
   */
  async create(
    prisonerId: string,
    createDto: CreateContactDto,
    userId: string,
  ): Promise<ContactResponseDto> {
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

    // Crear el contacto
    const contact = await this.prisma.prisonerContact.create({
      data: {
        prisonerId,
        name: createDto.name,
        relationship: createDto.relationship,
        phone: createDto.phone,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Log audit - creación sin DataChangeLog
    await this.auditService.logEntityCreated(
      AuditAction.CREATE,
      EntityType.PRISONER_CONTACT,
      contact.id,
      `Contacto registrado: ${contact.name} (${contact.relationship})`,
      userId,
      AuditModule.CONTACTS,
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
    );

    return this.mapToResponseDto(contact);
  }

  /**
   * Listar todos los contactos de emergencia del prisionero
   */
  async findAll(prisonerId: string): Promise<ContactResponseDto[]> {
    // Verificar que el prisionero exista
    const prisoner = await this.prisma.prisoner.findUnique({
      where: { id: prisonerId, isDeleted: false },
    });

    if (!prisoner) {
      throw new NotFoundException(
        `Prisionero con ID ${prisonerId} no encontrado`,
      );
    }

    const contacts = await this.prisma.prisonerContact.findMany({
      where: {
        prisonerId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return contacts.map((contact) => this.mapToResponseDto(contact));
  }

  /**
   * Obtener un contacto específico
   */
  async findOne(
    prisonerId: string,
    contactId: string,
  ): Promise<ContactResponseDto> {
    const contact = await this.prisma.prisonerContact.findFirst({
      where: {
        id: contactId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!contact) {
      throw new NotFoundException(
        `Contacto con ID ${contactId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    return this.mapToResponseDto(contact);
  }

  /**
   * Actualizar un contacto de emergencia
   */
  async update(
    prisonerId: string,
    contactId: string,
    updateDto: UpdateContactDto,
    userId: string,
  ): Promise<ContactResponseDto> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    // Verificar que el contacto exista
    const existingContact = await this.prisma.prisonerContact.findFirst({
      where: {
        id: contactId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!existingContact) {
      throw new NotFoundException(
        `Contacto con ID ${contactId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    // Build field changes array
    const fieldChanges: Array<{
      field_name: string;
      old_value?: string;
      new_value?: string;
    }> = [];

    if (
      updateDto.name !== undefined &&
      updateDto.name !== existingContact.name
    ) {
      fieldChanges.push({
        field_name: 'name',
        old_value: existingContact.name,
        new_value: updateDto.name,
      });
    }

    if (
      updateDto.relationship !== undefined &&
      updateDto.relationship !== existingContact.relationship
    ) {
      fieldChanges.push({
        field_name: 'relationship',
        old_value: existingContact.relationship,
        new_value: updateDto.relationship,
      });
    }

    if (
      updateDto.phone !== undefined &&
      updateDto.phone !== existingContact.phone
    ) {
      fieldChanges.push({
        field_name: 'phone',
        old_value: existingContact.phone,
        new_value: updateDto.phone,
      });
    }

    // Actualizar el contacto
    const updatedContact = await this.prisma.prisonerContact.update({
      where: { id: contactId },
      data: {
        name: updateDto.name,
        relationship: updateDto.relationship,
        phone: updateDto.phone,
        updatedBy: userId,
      },
    });

    // Log audit with field changes
    if (fieldChanges.length > 0) {
      await this.auditService.logEntityUpdated(
        AuditAction.UPDATE,
        EntityType.PRISONER_CONTACT,
        updatedContact.id,
        `Contacto actualizado: ${updatedContact.name}`,
        userId,
        AuditModule.CONTACTS,
        fieldChanges,
        userInfo?.email,
        userInfo?.name,
        userInfo?.role,
        ipAddress,
        userAgent,
      );
    }

    return this.mapToResponseDto(updatedContact);
  }

  /**
   * Eliminar (soft delete) un contacto de emergencia
   */
  async delete(
    prisonerId: string,
    contactId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    // Verificar que el contacto exista
    const existingContact = await this.prisma.prisonerContact.findFirst({
      where: {
        id: contactId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!existingContact) {
      throw new NotFoundException(
        `Contacto con ID ${contactId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    // Soft delete
    await this.prisma.prisonerContact.update({
      where: { id: contactId },
      data: {
        isDeleted: true,
        updatedBy: userId,
      },
    });

    // Log audit
    await this.auditService.logEntityDeleted(
      AuditAction.DELETE,
      EntityType.PRISONER_CONTACT,
      existingContact.id,
      `Contacto eliminado: ${existingContact.name} (${existingContact.relationship})`,
      userId,
      AuditModule.CONTACTS,
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
    );

    return { message: 'Contacto de emergencia eliminado exitosamente' };
  }

  /**
   * Mapear entidad Prisma a DTO de respuesta
   */
  private mapToResponseDto(contact: PrisonerContact): ContactResponseDto {
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
}
