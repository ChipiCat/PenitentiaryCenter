import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { StorageService } from './storage.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { S3Provider } from './providers/s3.provider';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FilesService, StorageService, CloudinaryProvider, S3Provider],
  exports: [FilesService],
})
export class FilesModule {}
