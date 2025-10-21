import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({ example: 'https://cloudinary.com/photo.jpg' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'cloudinary/prisoners/photos/xyz.jpg' })
  @IsString()
  @IsOptional()
  storagePath?: string;

  @ApiProperty({ example: 'photo_123.jpg' })
  @IsString()
  filename: string;

  @ApiProperty({ example: 'mi-foto.jpg' })
  @IsString()
  originalName: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 'jpg' })
  @IsString()
  extension: string;

  @ApiProperty({ example: 1024000 })
  @IsInt()
  @Min(0)
  size: number;

  @ApiProperty({ example: 'cloudinary', enum: ['cloudinary', 's3'] })
  @IsString()
  storageType: string;

  @ApiProperty({ example: 'prisoner_identity' })
  @IsString()
  entityType: string;

  @ApiProperty({ example: 'cuid-prisoner-123' })
  @IsString()
  entityId: string;

  @ApiProperty({ example: 'photo' })
  @IsString()
  fieldName: string;

  @ApiProperty({ example: 'user-cuid-123' })
  @IsString()
  createdBy: string;
}

export class FileResponseDto {
  @ApiProperty({ example: 'file-cuid-123' })
  id: string;

  @ApiProperty({ example: 'https://cloudinary.com/photo.jpg' })
  url: string;

  @ApiPropertyOptional({ example: 'cloudinary/prisoners/photos/xyz.jpg' })
  storagePath?: string;

  @ApiProperty({ example: 'photo_123.jpg' })
  filename: string;

  @ApiProperty({ example: 'mi-foto.jpg' })
  originalName: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 'jpg' })
  extension: string;

  @ApiProperty({ example: 1024000 })
  size: number;

  @ApiProperty({ example: 'cloudinary' })
  storageType: string;

  @ApiProperty({ example: 'prisoner_identity' })
  entityType: string;

  @ApiProperty({ example: 'cuid-prisoner-123' })
  entityId: string;

  @ApiProperty({ example: 'photo' })
  fieldName: string;

  @ApiProperty({ example: 'user-cuid-123' })
  createdBy: string;

  @ApiProperty({ example: '2025-10-16T12:00:00Z' })
  createdAt: string;

  @ApiPropertyOptional({ example: null })
  deletedAt?: string;
}
