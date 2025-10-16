import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { S3Provider } from './providers/s3.provider';
import { UploadResult } from './interfaces/storage-provider.interface';

@Injectable()
export class StorageService {
  constructor(
    private readonly cloudinaryProvider: CloudinaryProvider,
    private readonly s3Provider: S3Provider,
  ) {}

  /**
   * Detecta el tipo de archivo y selecciona el provider correcto
   * - Imágenes → Cloudinary
   * - PDFs y otros documentos → S3
   */
  async uploadFile(file: any, folder: string): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const isImage = file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf';

    if (isImage) {
      return this.cloudinaryProvider.uploadFile(file, folder);
    } else if (isPdf) {
      return this.s3Provider.uploadFile(file, folder);
    } else {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }
  }

  /**
   * Elimina un archivo del storage correspondiente
   */
  async deleteFile(storageType: string, storagePath: string): Promise<void> {
    if (storageType === 'cloudinary') {
      await this.cloudinaryProvider.deleteFile(storagePath);
    } else if (storageType === 's3') {
      await this.s3Provider.deleteFile(storagePath);
    }
  }
}
