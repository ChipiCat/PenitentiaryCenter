import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';
import { FileResponseDto } from '../../../files/dto/file.dto';

// ============================================================
// CREATE MANDATE DTO
// ============================================================
export class CreateMandateDto {
  @ApiProperty({
    enum: ['Detencion', 'Condena', 'Libertad', 'Apelacion', 'Traslado'],
    example: 'Detencion',
  })
  @IsIn(['Detencion', 'Condena', 'Libertad', 'Apelacion', 'Traslado'])
  type: 'Detencion' | 'Condena' | 'Libertad' | 'Apelacion' | 'Traslado';

  @ApiProperty({ example: '2025-01-20' })
  @IsDateString()
  issue_date: string;

  @ApiPropertyOptional({
    example: 'Mandato de detención preventiva por 90 días',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: ['Vigente', 'Ejecutado', 'Anulado'],
    example: 'Vigente',
  })
  @IsIn(['Vigente', 'Ejecutado', 'Anulado'])
  status: 'Vigente' | 'Ejecutado' | 'Anulado';
}

// ============================================================
// UPDATE MANDATE DTO
// ============================================================
export class UpdateMandateDto {
  @ApiPropertyOptional({
    enum: ['Detencion', 'Condena', 'Libertad', 'Apelacion', 'Traslado'],
    example: 'Detencion',
  })
  @IsIn(['Detencion', 'Condena', 'Libertad', 'Apelacion', 'Traslado'])
  @IsOptional()
  type?: 'Detencion' | 'Condena' | 'Libertad' | 'Apelacion' | 'Traslado';

  @ApiPropertyOptional({ example: '2025-01-20' })
  @IsDateString()
  @IsOptional()
  issue_date?: string;

  @ApiPropertyOptional({
    example: 'Mandato de detención preventiva por 90 días',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ['Vigente', 'Ejecutado', 'Anulado'],
    example: 'Vigente',
  })
  @IsIn(['Vigente', 'Ejecutado', 'Anulado'])
  @IsOptional()
  status?: 'Vigente' | 'Ejecutado' | 'Anulado';
}

// ============================================================
// MANDATE RESPONSE DTO
// ============================================================
export class MandateResponseDto {
  @ApiProperty({ example: 'mandate_cuid123' })
  id: string;

  @ApiProperty({ example: 'case_cuid456' })
  case_id: string;

  @ApiProperty({ example: 'Detencion' })
  type: string;

  @ApiProperty({ example: '2025-01-20' })
  issue_date: string;

  @ApiPropertyOptional({ example: 'file_cuid789' })
  file_id?: string;

  @ApiPropertyOptional({ type: () => FileResponseDto })
  file?: FileResponseDto;

  @ApiPropertyOptional({
    example: 'Mandato de detención preventiva por 90 días',
  })
  description?: string;

  @ApiProperty({ example: 'Vigente' })
  status: string;

  // Auditoría
  @ApiProperty({ example: false })
  is_deleted: boolean;

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
// UPLOAD MANDATE FILE DTO
// ============================================================
export class UploadMandateFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'PDF del mandato judicial',
  })
  file: any;
}
