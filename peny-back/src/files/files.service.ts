import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { StorageService } from './storage.service';
import { FileResponseDto } from './dto/file.dto';
import { UPLOAD_CONFIG } from '../common/config/config';
import { UploadedFile } from './interfaces/uploaded-file.interface';
import { File, AuditAction, AuditModule, EntityType } from 'generated/prisma';

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
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
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
   * Sube un archivo y guarda su metadata en la BD
   */
  async uploadFile(
    file: UploadedFile,
    entityType: string,
    entityId: string,
    fieldName: string,
    userId: string,
  ): Promise<FileResponseDto> {
    try {
      this.logger.log(
        `Starting file upload for ${fieldName} - entity: ${entityType}:${entityId}`,
      );
      const { ipAddress, userAgent } = this.getAuditMetadata();
      const userInfo = await this.getUserInfo(userId);

      // Validar archivo según configuración
      this.validateFile(file, fieldName);

      // Determinar carpeta según tipo
      const folder = this.getFolderForField(fieldName);

      // Subir a storage (Cloudinary o S3)
      this.logger.log(`Uploading file to storage provider, folder: ${folder}`);
      const uploadResult = await this.storageService.uploadFile(file, folder);

      // Extraer extensión
      const extension = file.originalname
        ? (file.originalname.split('.').pop() ?? '')
        : '';

      // Determinar tipo de storage
      const storageType = file.mimetype.startsWith('image/')
        ? 'cloudinary'
        : 's3';

      // Guardar en BD
      this.logger.log(`Saving file metadata to database`);
      const fileRecord = await this.prisma.file.create({
        data: {
          url: uploadResult.url,
          storagePath: uploadResult.storagePath || null,
          filename: uploadResult.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          extension,
          size: file.size,
          storageType,
          entityType,
          entityId,
          fieldName,
          createdBy: userId,
        },
      });

      // Log audit - creación sin DataChangeLog
      await this.auditService.logEntityCreated(
        AuditAction.FILE_UPLOAD,
        EntityType.FILE,
        fileRecord.id,
        `Archivo subido: ${fileRecord.originalName} (${fieldName}) para ${entityType}`,
        userId,
        AuditModule.FILES,
        userInfo?.email,
        userInfo?.name,
        userInfo?.role,
        ipAddress,
        userAgent,
      );

      this.logger.log(`File uploaded successfully: ${fileRecord.id}`);
      return this.mapToResponseDto(fileRecord);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error uploading file: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Error uploading file: ${String(error)}`);
      }
      throw error;
    }
  }

  /**
   * Elimina un archivo (soft delete)
   */
  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      this.logger.log(`Deleting file: ${fileId}`);
      const { ipAddress, userAgent } = this.getAuditMetadata();
      const userInfo = await this.getUserInfo(userId);

      const file = await this.prisma.file.findUnique({ where: { id: fileId } });

      if (!file) {
        throw new BadRequestException('File not found');
      }

      // Soft delete en BD
      await this.prisma.file.update({
        where: { id: fileId },
        data: { deletedAt: new Date() },
      });

      // Log audit - eliminación
      await this.auditService.logEntityDeleted(
        AuditAction.FILE_DELETE,
        EntityType.FILE,
        fileId,
        `Archivo eliminado: ${file.originalName} (${file.fieldName})`,
        userId,
        AuditModule.FILES,
        userInfo?.email,
        userInfo?.name,
        userInfo?.role,
        ipAddress,
        userAgent,
      );

      // Eliminar del storage
      try {
        await this.storageService.deleteFile(
          file.storageType,
          file.storagePath || '',
        );
      } catch (error) {
        this.logger.error(`Failed to delete file from storage: ${error}`);
      }

      this.logger.log(`File deleted successfully: ${fileId}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error deleting file: ${String(error)}`);
      }
      throw error;
    }
  }

  /**
   * Obtiene un archivo por ID
   */
  async findOne(fileId: string): Promise<FileResponseDto> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId, deletedAt: null },
    });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    return this.mapToResponseDto(file);
  }

  /**
   * Valida el archivo según configuración
   */
  private validateFile(file: UploadedFile, fieldName: string): void {
    let config: { allowedTypes: string[]; maxSize: number; folder: string };

    if (fieldName === 'photo') {
      config = UPLOAD_CONFIG.photo;
    } else if (fieldName.includes('fingerprint')) {
      config = UPLOAD_CONFIG.fingerprint;
    } else if (fieldName === 'medical_file') {
      config = UPLOAD_CONFIG.medical_file;
    } else if (fieldName === 'inventory') {
      config = UPLOAD_CONFIG.belonging_inventory;
    } else if (fieldName === 'mandate_document') {
      config = UPLOAD_CONFIG.mandate_document;
    } else {
      throw new BadRequestException('Invalid field name');
    }

    // Validar tipo
    if (!config.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${config.allowedTypes.join(', ')}`,
      );
    }

    // Validar tamaño
    if (file.size > config.maxSize) {
      throw new BadRequestException(
        `File too large. Max size: ${config.maxSize / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Determina la carpeta según el campo
   */
  private getFolderForField(fieldName: string): string {
    if (fieldName === 'photo') return UPLOAD_CONFIG.photo.folder;
    if (fieldName.includes('fingerprint'))
      return UPLOAD_CONFIG.fingerprint.folder;
    if (fieldName === 'medical_document')
      return UPLOAD_CONFIG.medical_file.folder;
    if (fieldName === 'inventory')
      return UPLOAD_CONFIG.belonging_inventory.folder;
    return 'uploads';
  }

  /**
   * Mapper de modelo Prisma a DTO
   */
  private mapToResponseDto(file: File): FileResponseDto {
    return {
      id: file.id,
      url: file.url,
      storagePath: file.storagePath || undefined,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      extension: file.extension,
      size: file.size,
      storageType: file.storageType,
      entityType: file.entityType,
      entityId: file.entityId,
      fieldName: file.fieldName,
      createdBy: file.createdBy,
      createdAt: file.createdAt.toISOString(),
      deletedAt: file.deletedAt ? file.deletedAt.toISOString() : undefined,
    };
  }
}
