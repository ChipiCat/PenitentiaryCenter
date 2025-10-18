import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilesService } from '../../files/files.service';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordResponseDto,
} from './dto/medical-record.dto';
import { File, MedicalRecord } from 'generated/prisma';
import { UploadedFile } from '../../files/interfaces/uploaded-file.interface';

@Injectable()
export class PrisonerMedicalRecordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  /**
   * Crear un nuevo registro médico
   */
  async create(
    prisonerId: string,
    createDto: CreateMedicalRecordDto,
    userId: string,
  ): Promise<MedicalRecordResponseDto> {
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
      await this.filesService.deleteFile(existingRecord.fileId);
    }

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
      await this.filesService.deleteFile(existingRecord.fileId);
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
