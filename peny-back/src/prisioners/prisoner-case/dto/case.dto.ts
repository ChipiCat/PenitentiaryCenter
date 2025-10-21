import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================================
// CREATE CASE DTO
// ============================================================
export class CreateCaseDto {
  @ApiProperty({ example: 'CASO-2025-001' })
  @IsString()
  case_number: string;

  @ApiProperty({ example: 'Robo con violencia' })
  @IsString()
  crime: string;

  @ApiProperty({
    enum: ['EnProceso', 'Condenado', 'Apelacion', 'Cerrado'],
    example: 'EnProceso',
  })
  @IsIn(['EnProceso', 'Condenado', 'Apelacion', 'Cerrado'])
  status: 'EnProceso' | 'Condenado' | 'Apelacion' | 'Cerrado';

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({ example: '2030-01-15' })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ example: 'Juzgado Penal del Distrito' })
  @IsString()
  @IsOptional()
  court_name?: string;

  @ApiPropertyOptional({ example: 'Juez María González' })
  @IsString()
  @IsOptional()
  judge_name?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sentence_years?: number;

  @ApiPropertyOptional({ example: 'Sentencia dictada en primera instancia' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

// ============================================================
// UPDATE CASE DTO
// ============================================================
export class UpdateCaseDto {
  @ApiPropertyOptional({ example: 'CASO-2025-001' })
  @IsString()
  @IsOptional()
  case_number?: string;

  @ApiPropertyOptional({ example: 'Robo con violencia' })
  @IsString()
  @IsOptional()
  crime?: string;

  @ApiPropertyOptional({
    enum: ['EnProceso', 'Condenado', 'Apelacion', 'Cerrado'],
    example: 'EnProceso',
  })
  @IsIn(['EnProceso', 'Condenado', 'Apelacion', 'Cerrado'])
  @IsOptional()
  status?: 'EnProceso' | 'Condenado' | 'Apelacion' | 'Cerrado';

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ example: '2030-01-15' })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ example: 'Juzgado Penal del Distrito' })
  @IsString()
  @IsOptional()
  court_name?: string;

  @ApiPropertyOptional({ example: 'Juez María González' })
  @IsString()
  @IsOptional()
  judge_name?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sentence_years?: number;

  @ApiPropertyOptional({ example: 'Sentencia dictada en primera instancia' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

// ============================================================
// CASE RESPONSE DTO
// ============================================================
export class CaseResponseDto {
  @ApiProperty({ example: 'case_cuid123' })
  id: string;

  @ApiProperty({ example: 'prisoner_cuid456' })
  prisoner_id: string;

  @ApiProperty({ example: 'CASO-2025-001' })
  case_number: string;

  @ApiProperty({ example: 'Robo con violencia' })
  crime: string;

  @ApiProperty({ example: 'EnProceso' })
  status: string;

  @ApiProperty({ example: '2025-01-15' })
  start_date: string;

  @ApiPropertyOptional({ example: '2030-01-15' })
  end_date?: string;

  @ApiPropertyOptional({ example: 'Juzgado Penal del Distrito' })
  court_name?: string;

  @ApiPropertyOptional({ example: 'Juez María González' })
  judge_name?: string;

  @ApiPropertyOptional({ example: 5 })
  sentence_years?: number;

  @ApiPropertyOptional({ example: 'Sentencia dictada en primera instancia' })
  remarks?: string;

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
// CASE LIST QUERY DTO
// ============================================================
export class CaseListQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    enum: ['EnProceso', 'Condenado', 'Apelacion', 'Cerrado'],
    example: 'EnProceso',
  })
  @IsOptional()
  @IsIn(['EnProceso', 'Condenado', 'Apelacion', 'Cerrado'])
  status?: string;

  @ApiPropertyOptional({ example: 'CASO-2025' })
  @IsOptional()
  @IsString()
  search?: string;
}
