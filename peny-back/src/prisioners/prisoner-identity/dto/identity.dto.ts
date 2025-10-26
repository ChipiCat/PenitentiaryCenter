import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';
import { FileResponseDto } from '../../../files/dto/file.dto';

export class CreateIdentityDto {
  @ApiProperty({ example: 'García' })
  @IsString()
  surname: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  first_name: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birth_date?: string;

  @ApiPropertyOptional({ example: 'Ciudad de México' })
  @IsString()
  @IsOptional()
  birth_place?: string;

  @ApiPropertyOptional({ example: 'Colonia Centro' })
  @IsString()
  @IsOptional()
  residence?: string;

  @ApiPropertyOptional({
    enum: ['Local', 'CiudadanoNacional', 'CiudadanoExtranjero'],
    example: 'Local',
  })
  @IsIn(['Local', 'CiudadanoNacional', 'CiudadanoExtranjero'])
  @IsOptional()
  citizenship_type?: 'Local' | 'CiudadanoNacional' | 'CiudadanoExtranjero';

  @ApiPropertyOptional({ example: 'México' })
  @IsString()
  @IsOptional()
  country_of_origin?: string;

  @ApiPropertyOptional({ example: 'Por nacimiento' })
  @IsString()
  @IsOptional()
  nationality_type?: string;

  @ApiPropertyOptional({ example: 'Mexicana' })
  @IsString()
  @IsOptional()
  nationality?: string;
}

export class IdentityResponseDto {
  @ApiProperty({ example: 'identity_cuid123' })
  id: string;

  @ApiProperty({ example: 'prisoner_cuid456' })
  prisoner_id: string;

  // URLs de archivos (más conveniente para el frontend)
  @ApiPropertyOptional({
    description: 'Photo file ID',
    example: 'cm68qh0y90000i0yrwsefybrk',
  })
  @IsOptional()
  @IsString()
  photo_file_id?: string;

  @ApiPropertyOptional({
    description: 'Photo file details',
    type: () => FileResponseDto,
  })
  photo_file?: FileResponseDto;

  @ApiPropertyOptional({
    description: 'Right hand fingerprint file ID',
    example: 'cm68qh0y90001i0yrwsefybrk',
  })
  @IsOptional()
  @IsString()
  right_fingerprint_file_id?: string;

  @ApiPropertyOptional({
    description: 'Right hand fingerprint file details',
    type: () => FileResponseDto,
  })
  right_fingerprint?: FileResponseDto;

  @ApiPropertyOptional({
    description: 'Left hand fingerprint file ID',
    example: 'cm68qh0y90002i0yrwsefybrk',
  })
  @IsOptional()
  @IsString()
  left_fingerprint_file_id?: string;

  @ApiPropertyOptional({
    description: 'Left hand fingerprint file details',
    type: () => FileResponseDto,
  })
  left_fingerprint?: FileResponseDto;

  // Campos de identidad
  @ApiProperty({ example: 'García' })
  surname: string;

  @ApiProperty({ example: 'Juan' })
  first_name: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  birth_date?: string;

  @ApiPropertyOptional({ example: 'Ciudad de México' })
  birth_place?: string;

  @ApiPropertyOptional({ example: 'Colonia Centro' })
  residence?: string;

  @ApiPropertyOptional({ example: 'Local' })
  citizenship_type?: string;

  @ApiPropertyOptional({ example: 'México' })
  country_of_origin?: string;

  @ApiPropertyOptional({ example: 'Por nacimiento' })
  nationality_type?: string;

  @ApiPropertyOptional({ example: 'Mexicana' })
  nationality?: string;

  // Auditoría
  @ApiProperty({ example: false })
  isDeleted: boolean;

  @ApiProperty({ example: 'user_cuid1' })
  created_by: string;

  @ApiProperty({ example: 'user_cuid2' })
  updated_by: string;

  @ApiProperty({ example: '2025-10-15T12:00:00Z' })
  created_at: string;

  @ApiProperty({ example: '2025-10-15T12:00:00Z' })
  updated_at: string;
}

// ============================================================
// UPDATE IDENTITY DTO
// ============================================================
export class UpdateIdentityDto {
  // Solo campos editables (sin archivos)
  @ApiPropertyOptional({ example: 'García' })
  @IsString()
  @IsOptional()
  surname?: string;

  @ApiPropertyOptional({ example: 'Juan' })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birth_date?: string;

  @ApiPropertyOptional({ example: 'Ciudad de México' })
  @IsString()
  @IsOptional()
  birth_place?: string;

  @ApiPropertyOptional({ example: 'Colonia Centro' })
  @IsString()
  @IsOptional()
  residence?: string;

  @ApiPropertyOptional({
    enum: ['Local', 'Ciudadano Nacional', 'Ciudadano Extranjero'],
  })
  @IsIn(['Local', 'Ciudadano Nacional', 'Ciudadano Extranjero'])
  @IsOptional()
  citizenship_type?: 'Local' | 'Ciudadano Nacional' | 'Ciudadano Extranjero';

  @ApiPropertyOptional({ example: 'México' })
  @IsString()
  @IsOptional()
  country_of_origin?: string;

  @ApiPropertyOptional({ example: 'Por nacimiento' })
  @IsString()
  @IsOptional()
  nationality_type?: string;

  @ApiPropertyOptional({ example: 'Mexicana' })
  @IsString()
  @IsOptional()
  nationality?: string;
}

// ============================================================
// UPLOAD DTOs (se mantienen igual)
// ============================================================
export class UploadPhotoDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Imagen del prisionero (JPG, PNG)',
  })
  file: any;
}

export class UploadFingerprintDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Imagen o PDF de la huella dactilar',
  })
  file: any;

  @ApiProperty({ enum: ['right', 'left'], example: 'right' })
  @IsIn(['right', 'left'])
  hand: 'right' | 'left';
}

// ============================================================
// UPLOAD RESPONSE DTO
// ============================================================
export class UploadFileResponseDto {
  @ApiProperty({ example: 'Archivo subido exitosamente' })
  message: string;

  @ApiProperty({ type: () => FileResponseDto })
  file: FileResponseDto;

  @ApiProperty({ type: () => IdentityResponseDto })
  identity: IdentityResponseDto;
}
