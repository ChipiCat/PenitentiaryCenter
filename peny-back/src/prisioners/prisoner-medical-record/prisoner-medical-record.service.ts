import { Injectable, NotFoundException, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { FilesService } from '../../files/files.service';
import { AuditService } from '../../audit/audit.service';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordResponseDto,
} from './dto/medical-record.dto';
import {
  File,
  MedicalRecord,
  AuditAction,
  AuditModule,
  EntityType,
} from 'generated/prisma';
import { UploadedFile } from '../../files/interfaces/uploaded-file.interface';

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
export class PrisonerMedicalRecordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
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
   * Crear un nuevo registro médico
   */
  async create(
    prisonerId: string,
    createDto: CreateMedicalRecordDto,
    userId: string,
  ): Promise<MedicalRecordResponseDto> {
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

    // Crear el registro médico
    const medicalRecord = await this.prisma.medicalRecord.create({
      data: {
        prisonerId,
        doctorName: createDto.doctor_name,
        examinationDate: createDto.examination_date
          ? new Date(createDto.examination_date)
          : null,
        referenceNumber: createDto.reference_number,
        notes: createDto.notes,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        file: true,
      },
    });

    // Log audit - creación sin DataChangeLog
    await this.auditService.logEntityCreated(
      AuditAction.CREATE,
      EntityType.MEDICAL_RECORD,
      medicalRecord.id,
      `Registro médico creado: Dr. ${medicalRecord.doctorName || 'N/A'}`,
      userId,
      AuditModule.MEDICAL,
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
      prisonerId, // prisonerRelatedId
    );

    return this.mapToResponseDto(medicalRecord);
  }

  /**
   * Listar todos los registros médicos del prisionero
   */
  async findAll(prisonerId: string): Promise<MedicalRecordResponseDto[]> {
    // Verificar que el prisionero exista
    const prisoner = await this.prisma.prisoner.findUnique({
      where: { id: prisonerId, isDeleted: false },
    });

    if (!prisoner) {
      throw new NotFoundException(
        `Prisionero con ID ${prisonerId} no encontrado`,
      );
    }

    const records = await this.prisma.medicalRecord.findMany({
      where: {
        prisonerId,
        isDeleted: false,
      },
      include: {
        file: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record) => this.mapToResponseDto(record));
  }

  /**
   * Obtener un registro médico específico
   */
  async findOne(
    prisonerId: string,
    recordId: string,
  ): Promise<MedicalRecordResponseDto> {
    const record = await this.prisma.medicalRecord.findFirst({
      where: {
        id: recordId,
        prisonerId,
        isDeleted: false,
      },
      include: {
        file: true,
      },
    });

    if (!record) {
      throw new NotFoundException(
        `Registro médico con ID ${recordId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    return this.mapToResponseDto(record);
  }

  /**
   * Actualizar un registro médico
   */
  async update(
    prisonerId: string,
    recordId: string,
    updateDto: UpdateMedicalRecordDto,
    userId: string,
  ): Promise<MedicalRecordResponseDto> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    // Verificar que el registro exista
    const existingRecord = await this.prisma.medicalRecord.findFirst({
      where: {
        id: recordId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!existingRecord) {
      throw new NotFoundException(
        `Registro médico con ID ${recordId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    // Build field changes array
    const fieldChanges: Array<{
      field_name: string;
      old_value?: string;
      new_value?: string;
    }> = [];

    if (
      updateDto.doctor_name !== undefined &&
      updateDto.doctor_name !== existingRecord.doctorName
    ) {
      fieldChanges.push({
        field_name: 'doctor_name',
        old_value: existingRecord.doctorName || 'null',
        new_value: updateDto.doctor_name || 'null',
      });
    }

    if (updateDto.examination_date !== undefined) {
      const newDate = updateDto.examination_date
        ? new Date(updateDto.examination_date).toISOString()
        : null;
      const oldDate = existingRecord.examinationDate?.toISOString() || null;
      if (newDate !== oldDate) {
        fieldChanges.push({
          field_name: 'examination_date',
          old_value: oldDate || 'null',
          new_value: newDate || 'null',
        });
      }
    }

    if (
      updateDto.reference_number !== undefined &&
      updateDto.reference_number !== existingRecord.referenceNumber
    ) {
      fieldChanges.push({
        field_name: 'reference_number',
        old_value: existingRecord.referenceNumber || 'null',
        new_value: updateDto.reference_number || 'null',
      });
    }

    if (
      updateDto.notes !== undefined &&
      updateDto.notes !== existingRecord.notes
    ) {
      fieldChanges.push({
        field_name: 'notes',
        old_value: existingRecord.notes || 'null',
        new_value: updateDto.notes || 'null',
      });
    }

    // Actualizar el registro
    const updatedRecord = await this.prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        doctorName: updateDto.doctor_name,
        examinationDate: updateDto.examination_date
          ? new Date(updateDto.examination_date)
          : undefined,
        referenceNumber: updateDto.reference_number,
        notes: updateDto.notes,
        updatedBy: userId,
      },
      include: {
        file: true,
      },
    });

    // Log audit with field changes
    if (fieldChanges.length > 0) {
      await this.auditService.logEntityUpdated(
        AuditAction.UPDATE,
        EntityType.MEDICAL_RECORD,
        updatedRecord.id,
        `Registro médico actualizado: Dr. ${updatedRecord.doctorName || 'N/A'}`,
        userId,
        AuditModule.MEDICAL,
        fieldChanges,
        userInfo?.email,
        userInfo?.name,
        userInfo?.role,
        ipAddress,
        userAgent,
        prisonerId, // prisonerRelatedId
      );
    }

    return this.mapToResponseDto(updatedRecord);
  }

  /**
   * Eliminar (soft delete) un registro médico
   */
  async delete(
    prisonerId: string,
    recordId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const userInfo = await this.getUserInfo(userId);

    // Verificar que el registro exista
    const existingRecord = await this.prisma.medicalRecord.findFirst({
      where: {
        id: recordId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!existingRecord) {
      throw new NotFoundException(
        `Registro médico con ID ${recordId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    // Soft delete
    await this.prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        isDeleted: true,
        updatedBy: userId,
      },
    });

    // Si tiene archivo asociado, marcarlo como eliminado
    if (existingRecord.fileId) {
      await this.filesService.deleteFile(existingRecord.fileId, userId);
    }

    // Log audit
    await this.auditService.logEntityDeleted(
      AuditAction.DELETE,
      EntityType.MEDICAL_RECORD,
      existingRecord.id,
      `Registro médico eliminado: Dr. ${existingRecord.doctorName || 'N/A'}`,
      userId,
      AuditModule.MEDICAL,
      userInfo?.email,
      userInfo?.name,
      userInfo?.role,
      ipAddress,
      userAgent,
      prisonerId, // prisonerRelatedId
    );

    return { message: 'Registro médico eliminado exitosamente' };
  }

  /**
   * Subir archivo médico (PDF/documento)
   */
  async uploadFile(
    prisonerId: string,
    recordId: string,
    file: UploadedFile,
    userId: string,
  ): Promise<MedicalRecordResponseDto> {
    // Verificar que el registro exista
    const existingRecord = await this.prisma.medicalRecord.findFirst({
      where: {
        id: recordId,
        prisonerId,
        isDeleted: false,
      },
    });

    if (!existingRecord) {
      throw new NotFoundException(
        `Registro médico con ID ${recordId} no encontrado para el prisionero ${prisonerId}`,
      );
    }

    // Si ya tiene archivo, eliminar el anterior
    if (existingRecord.fileId) {
      await this.filesService.deleteFile(existingRecord.fileId, userId);
    }

    // Subir el nuevo archivo
    const uploadedFile = await this.filesService.uploadFile(
      file,
      'medical_record',
      recordId,
      'medical_file',
      userId,
    );

    // Actualizar el registro con el fileId
    const updatedRecord = await this.prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        fileId: uploadedFile.id,
        updatedBy: userId,
      },
      include: {
        file: true,
      },
    });

    return this.mapToResponseDto(updatedRecord);
  }

  /**
   * Mapear entidad Prisma a DTO de respuesta
   */
  private mapToResponseDto(
    record: MedicalRecord & { file?: File | null },
  ): MedicalRecordResponseDto {
    return {
      id: record.id,
      prisoner_id: record.prisonerId,
      doctor_name: record.doctorName || '',
      examination_date: record.examinationDate
        ? record.examinationDate.toISOString().split('T')[0]
        : undefined,
      reference_number: record.referenceNumber || '',
      notes: record.notes || '',
      file_id: record.fileId || '',
      file:
        record.file == null
          ? undefined
          : {
              id: record.file.id,
              url: record.file.url,
              storagePath: record.file.storagePath ?? undefined,
              filename: record.file.filename,
              originalName: record.file.originalName,
              mimeType: record.file.mimeType,
              extension: record.file.extension,
              size: record.file.size,
              storageType: record.file.storageType,
              entityType: record.file.entityType,
              entityId: record.file.entityId,
              fieldName: record.file.fieldName,
              createdBy: record.file.createdBy,
              createdAt: record.file.createdAt.toISOString(),
              deletedAt: record.file.deletedAt
                ? record.file.deletedAt.toISOString()
                : undefined,
            },
      created_by: record.createdBy || '',
      updated_by: record.updatedBy || '',
      created_at: record.createdAt.toISOString(),
      updated_at: record.updatedAt.toISOString(),
    };
  }
}
