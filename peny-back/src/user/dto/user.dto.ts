import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la respuesta de archivo
 */
export class FileResponseDto {
  @ApiProperty({ example: 'clxxxxxxxx' })
  id: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg' })
  url: string;

  @ApiProperty({ example: 'photo.jpg' })
  filename: string;

  @ApiProperty({ example: 'my-photo.jpg' })
  originalName: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 'jpg' })
  extension: string;

  @ApiProperty({ example: 1024000 })
  size: number;
}

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SECRETARY })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: 'clxxxxxxxx', description: 'ID del archivo de foto del perfil' })
  @IsString()
  @IsOptional()
  photoFileId?: string;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', minLength: 2 })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: 'clxxxxxxxx', description: 'ID del archivo de foto del perfil' })
  @IsString()
  @IsOptional()
  photoFileId?: string;

  @ApiPropertyOptional({ example: false, description: 'Indicador de primer inicio de sesión' })
  @IsBoolean()
  @IsOptional()
  isFirstLogin?: boolean;
}

export class UserResponseDto {
  @ApiProperty({ example: 'clxxxxxxxx' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SECRETARY })
  role: UserRole;

  @ApiPropertyOptional({ type: FileResponseDto, nullable: true })
  photoFile?: FileResponseDto | null;

  @ApiProperty({ example: true })
  isFirstLogin: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  size?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
