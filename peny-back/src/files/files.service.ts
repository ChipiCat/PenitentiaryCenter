import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { CreateFileDto, FileResponseDto } from './dto/file.dto';
import { UPLOAD_CONFIG } from '../common/config/config';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Sube un archivo y guarda su metadata en la BD
   */
  async uploadFile(
    file: any,
    entityType: string,
    entityId: string,
    fieldName: string,
    userId: string,
  ): Promise<FileResponseDto> {
    try {
      this.logger.log(
        `Starting file upload for ${fieldName} - entity: ${entityType}:${entityId}`,
      );

      // Validar archivo según configuración
      this.validateFile(file, fieldName);

      // Determinar carpeta según tipo
      const folder = this.getFolderForField(fieldName);

      // Subir a storage (Cloudinary o S3)
      this.logger.log(`Uploading file to storage provider, folder: ${folder}`);
      const uploadResult = await this.storageService.uploadFile(file, folder);

      // Extraer extensión
      const extension = file.originalname
        ? file.originalname.split('.').pop()
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

      this.logger.log(`File uploaded successfully: ${fileRecord.id}`);
      return this.mapToResponseDto(fileRecord);
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Elimina un archivo (soft delete)
   */
  async deleteFile(fileId: string): Promise<void> {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    // Soft delete en BD
    await this.prisma.file.update({
      where: { id: fileId },
      data: { deletedAt: new Date() },
    });

    // Eliminar del storage
    try {
      await this.storageService.deleteFile(
        file.storageType,
        file.storagePath || '',
      );
    } catch (error) {
      this.logger.error(`Failed to delete file from storage: ${error}`);
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
  private validateFile(file: any, fieldName: string): void {
    let config;

    if (fieldName === 'photo') {
      config = UPLOAD_CONFIG.photo;
    } else if (fieldName.includes('fingerprint')) {
      config = UPLOAD_CONFIG.fingerprint;
    } else if (fieldName === 'medical_file') {
      config = UPLOAD_CONFIG.medical_file;
    } else if (fieldName === 'inventory') {
      config = UPLOAD_CONFIG.belonging_inventory;
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
  private mapToResponseDto(file: any): FileResponseDto {
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
