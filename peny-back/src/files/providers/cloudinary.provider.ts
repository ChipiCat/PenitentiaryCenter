import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  IStorageProvider,
  UploadResult,
} from '../interfaces/storage-provider.interface';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryProvider implements IStorageProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);

  constructor() {
    // Configurar Cloudinary con las credenciales del .env
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Validar que las credenciales estén configuradas
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      this.logger.warn(
        'Cloudinary credentials not configured. Please check your .env file.',
      );
    } else {
      this.logger.log('Cloudinary configured successfully');
    }
  }

  async uploadFile(file: any, folder: string): Promise<UploadResult> {
    try {
      this.logger.log(
        `Uploading to Cloudinary: ${file.originalname} to folder ${folder}`,
      );

      // Convertir el buffer a base64 data URI para Cloudinary
      const base64File = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      // Subir a Cloudinary
      const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(
        base64File,
        {
          folder: folder,
          resource_type: 'auto', // Detecta automáticamente el tipo (image, video, raw)
          use_filename: true,
          unique_filename: true,
        },
      );

      this.logger.log(
        `File uploaded successfully to Cloudinary: ${uploadResult.secure_url}`,
      );

      return {
        url: uploadResult.secure_url,
        storagePath: uploadResult.public_id,
        filename: uploadResult.original_filename || file.originalname,
        size: uploadResult.bytes,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error(
        `Error uploading to Cloudinary: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to upload file to Cloudinary: ${error.message}`,
      );
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      this.logger.log(`Deleting from Cloudinary: ${publicId}`);

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        this.logger.log(
          `File deleted successfully from Cloudinary: ${publicId}`,
        );
      } else {
        this.logger.warn(
          `Could not delete file from Cloudinary: ${publicId}, result: ${result.result}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error deleting from Cloudinary: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to delete file from Cloudinary: ${error.message}`,
      );
    }
  }
}
