import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  IStorageProvider,
  UploadResult,
} from '../interfaces/storage-provider.interface';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { UploadedFile } from '../interfaces/uploaded-file.interface';

@Injectable()
export class S3Provider implements IStorageProvider {
  private readonly logger = new Logger(S3Provider.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.region = process.env.AWS_REGION || 'us-east-1';

    // Configurar el cliente S3
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // Validar que las credenciales estén configuradas
    if (
      !process.env.AWS_S3_BUCKET ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY
    ) {
      this.logger.warn(
        'AWS S3 credentials not configured. Please check your .env file.',
      );
    } else {
      this.logger.log(
        `AWS S3 configured successfully - Bucket: ${this.bucket}, Region: ${this.region}`,
      );
    }
  }

  async uploadFile(file: UploadedFile, folder: string): Promise<UploadResult> {
    try {
      this.logger.log(
        `Uploading to S3: ${file.originalname} to folder ${folder}`,
      );

      if (!file.buffer) {
        throw new InternalServerErrorException(
          'File buffer is required for S3 upload',
        );
      }

      const filename = `${Date.now()}_${file.originalname}`;
      const key = `${folder}/${filename}`;

      // Comando para subir el archivo
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Hacer el archivo público (ajusta según tus necesidades)
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded successfully to S3: ${url}`);

      return {
        url,
        storagePath: key,
        filename,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errMsg = String((error as { message?: any }).message);
        this.logger.error(
          `Error uploading to S3: ${errMsg}`,
          (error as Error).stack,
        );
        throw new InternalServerErrorException(
          `Failed to upload file to S3: ${errMsg}`,
        );
      } else {
        this.logger.error('Unknown error uploading to S3', String(error));
        throw new InternalServerErrorException(
          'Failed to upload file to S3: Unknown error',
        );
      }
    }
  }

  async deleteFile(storagePath: string): Promise<void> {
    try {
      this.logger.log(`Deleting from S3: ${storagePath}`);

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storagePath,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted successfully from S3: ${storagePath}`);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errMsg = String((error as { message?: any }).message);
        this.logger.error(
          `Error deleting from S3: ${errMsg}`,
          (error as Error).stack,
        );
        throw new InternalServerErrorException(
          `Failed to delete file from S3: ${errMsg}`,
        );
      } else {
        this.logger.error('Unknown error deleting from S3', String(error));
        throw new InternalServerErrorException(
          'Failed to delete file from S3: Unknown error',
        );
      }
    }
  }
}
