import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilesService } from '../../files/files.service';
import {
  CreateMandateDto,
  UpdateMandateDto,
  MandateResponseDto,
} from './dto/mandate.dto';
import {
  File,
  MandateStatus,
  MandateType,
  PrisonerMandate,
} from '../../../generated/prisma';
import type { UploadedFile } from '../../files/interfaces/uploaded-file.interface';

@Injectable()
export class PrisonerMandateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  /**
   * Crear un nuevo mandato judicial para un caso
   */
  async create(
    caseId: string,
    createDto: CreateMandateDto,
    userId: string,
  ): Promise<MandateResponseDto> {
    // Verificar que el caso existe
    const prisonerCase = await this.prisma.prisonerCase.findUnique({
      where: { id: caseId, isDeleted: false },
    });

    if (!prisonerCase) {
      throw new NotFoundException(`Caso con ID ${caseId} no encontrado`);
    }

    const mandate = await this.prisma.prisonerMandate.create({
      data: {
        caseId,
        type: createDto.type as MandateType,
        issueDate: new Date(createDto.issue_date),
        description: createDto.description,
        status: createDto.status as MandateStatus,
        createdBy: userId,
        updatedBy: userId,
      },
      include: { file: true },
    });

    return this.mapToResponseDto(mandate);
  }

  /**
   * Listar todos los mandatos de un caso
   */
  async findAll(caseId: string): Promise<MandateResponseDto[]> {
    const mandates = await this.prisma.prisonerMandate.findMany({
      where: { caseId, isDeleted: false },
      include: { file: true },
      orderBy: { createdAt: 'desc' },
    });

    return mandates.map((m) => this.mapToResponseDto(m));
  }

  /**
   * Listar solo mandatos vigentes de un caso
   */
  async findActive(caseId: string): Promise<MandateResponseDto[]> {
    const mandates = await this.prisma.prisonerMandate.findMany({
      where: {
        caseId,
        isDeleted: false,
        status: 'Vigente',
      },
      include: { file: true },
      orderBy: { createdAt: 'desc' },
    });

    return mandates.map((m) => this.mapToResponseDto(m));
  }

  /**
   * Obtener un mandato por ID
   */
  async findOne(mandateId: string): Promise<MandateResponseDto> {
    const mandate = await this.prisma.prisonerMandate.findFirst({
      where: { id: mandateId, isDeleted: false },
      include: { file: true },
    });

    if (!mandate) {
      throw new NotFoundException(`Mandato con ID ${mandateId} no encontrado`);
    }

    return this.mapToResponseDto(mandate);
  }

  /**
   * Actualizar un mandato
   */
  async update(
    mandateId: string,
    updateDto: UpdateMandateDto,
    userId: string,
  ): Promise<MandateResponseDto> {
    const existing = await this.prisma.prisonerMandate.findFirst({
      where: { id: mandateId, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Mandato con ID ${mandateId} no encontrado`);
    }

    const mandate = await this.prisma.prisonerMandate.update({
      where: { id: mandateId },
      data: {
        type: updateDto.type as MandateType | undefined,
        issueDate: updateDto.issue_date
          ? new Date(updateDto.issue_date)
          : undefined,
        description: updateDto.description,
        status: updateDto.status as MandateStatus | undefined,
        updatedBy: userId,
      },
      include: { file: true },
    });

    return this.mapToResponseDto(mandate);
  }

  /**
   * Eliminar (soft delete) un mandato
   */
  async remove(mandateId: string): Promise<void> {
    const existing = await this.prisma.prisonerMandate.findFirst({
      where: { id: mandateId, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Mandato con ID ${mandateId} no encontrado`);
    }

    await this.prisma.prisonerMandate.update({
      where: { id: mandateId },
      data: { isDeleted: true },
    });
  }

  /**
   * Subir archivo PDF del mandato
   */
  async uploadFile(
    mandateId: string,
    file: UploadedFile,
    userId: string,
  ): Promise<MandateResponseDto> {
    // Verificar que el mandato existe
    const mandate = await this.prisma.prisonerMandate.findFirst({
      where: { id: mandateId, isDeleted: false },
    });

    if (!mandate) {
      throw new NotFoundException(`Mandato con ID ${mandateId} no encontrado`);
    }

    // Subir el archivo
    const fileRecord = await this.filesService.uploadFile(
      file,
      'prisoner_mandate',
      mandateId,
      'mandate_document',
      userId,
    );

    // Si existía un archivo anterior, eliminarla
    if (mandate.fileId) {
      await this.filesService.deleteFile(mandate.fileId, userId);
    }

    // Actualizar el mandato con el nuevo file
    const updated = await this.prisma.prisonerMandate.update({
      where: { id: mandateId },
      data: {
        fileId: fileRecord.id,
        updatedBy: userId,
      },
      include: { file: true },
    });

    return this.mapToResponseDto(updated);
  }

  /**
   * Eliminar archivo del mandato
   */
  async deleteFile(mandateId: string, userId: string): Promise<void> {
    const mandate = await this.prisma.prisonerMandate.findFirst({
      where: { id: mandateId, isDeleted: false },
    });

    if (!mandate) {
      throw new NotFoundException(`Mandato con ID ${mandateId} no encontrado`);
    }

    if (!mandate.fileId) {
      throw new NotFoundException('El mandato no tiene archivo asociado');
    }

    // Eliminar el archivo
    await this.filesService.deleteFile(mandate.fileId, userId);

    // Actualizar el mandato para quitar la referencia
    await this.prisma.prisonerMandate.update({
      where: { id: mandateId },
      data: { fileId: null },
    });
  }

  /**
   * Mapper de modelo Prisma a DTO
   */
  private mapToResponseDto(
    mandate: PrisonerMandate & { file?: File | null },
  ): MandateResponseDto {
    return {
      id: mandate.id,
      case_id: mandate.caseId,
      type: mandate.type,
      issue_date: mandate.issueDate.toISOString().split('T')[0],
      file_id: mandate.fileId || undefined,
      file: mandate.file
        ? {
            id: mandate.file.id,
            url: mandate.file.url,
            storagePath: mandate.file.storagePath || undefined,
            filename: mandate.file.filename,
            originalName: mandate.file.originalName,
            mimeType: mandate.file.mimeType,
            extension: mandate.file.extension,
            size: mandate.file.size,
            storageType: mandate.file.storageType,
            entityType: mandate.file.entityType,
            entityId: mandate.file.entityId,
            fieldName: mandate.file.fieldName,
            createdBy: mandate.file.createdBy,
            createdAt: mandate.file.createdAt.toISOString(),
            deletedAt: mandate.file.deletedAt?.toISOString() || undefined,
          }
        : undefined,
      description: mandate.description || undefined,
      status: mandate.status,
      is_deleted: mandate.isDeleted,
      created_by: mandate.createdBy || '',
      updated_by: mandate.updatedBy || '',
      created_at: mandate.createdAt.toISOString(),
      updated_at: mandate.updatedAt.toISOString(),
    };
  }
}
