import {
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PaginationMetaDto,
  ResponseListDto,
} from 'src/common/interfaces/entity.interface';

export class UpdatePrisonerDto {
  @ApiPropertyOptional({ example: 'REG-12345' })
  @IsString()
  @IsOptional()
  registration_number?: string;

  @ApiPropertyOptional({ example: 'FISC-67890' })
  @IsString()
  @IsOptional()
  fiscal_file_number?: string;

  @ApiPropertyOptional({
    enum: ['Activo', 'Trasladado', 'Liberado', 'Archivado'],
    example: 'Activo',
  })
  @IsIn(['Activo', 'Trasladado', 'Liberado', 'Archivado'])
  @IsOptional()
  status?: 'Activo' | 'Trasladado' | 'Liberado' | 'Archivado';
}

export class PrisonerListQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    enum: ['Activo', 'Trasladado', 'Liberado', 'Archivado'],
    example: 'Activo',
  })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  search?: string;
}

export class PrisonerListResponseDto extends ResponseListDto<PrisonerResponseDTO> {
  constructor(data: PrisonerResponseDTO[], pagination: PaginationMetaDto) {
    super(data, pagination);
  }
}

export class CreatePrisonerDTO {
  @ApiProperty({
    example: 'REG-12345',
    description: 'Número de registro único del prisionero',
  })
  @IsString()
  @MinLength(1)
  registration_number: string;

  @ApiProperty({
    example: '2025-10-14',
    description: 'Fecha de admisión en formato ISO 8601',
  })
  @IsDateString()
  admission_date: string;

  @ApiPropertyOptional({
    example: 'FISC-67890',
    description: 'Número de expediente fiscal',
  })
  @IsString()
  @IsOptional()
  fiscal_file_number?: string;

  @ApiPropertyOptional({
    enum: ['Activo', 'Trasladado', 'Liberado', 'Archivado'],
    example: 'Activo',
    description: 'Estado actual del prisionero',
  })
  @IsIn(['Activo', 'Trasladado', 'Liberado', 'Archivado'])
  @IsOptional()
  status?: 'Activo' | 'Trasladado' | 'Liberado' | 'Archivado';
}

export class PrisonerResponseDTO {
  @ApiProperty({ example: 'cuid-123', description: 'ID único del prisionero' })
  id: string;

  @ApiProperty({ example: 'REG-12345' })
  registration_number: string;

  @ApiProperty({ example: '2025-10-14' })
  admission_date: string;

  @ApiPropertyOptional({ example: 'FISC-67890' })
  fiscal_file_number?: string;

  @ApiProperty({ example: 'Activo' })
  status: string;

  @ApiProperty({ example: false })
  isDeleted: boolean;

  @ApiProperty({ example: 'user-uuid-1' })
  created_by: string;

  @ApiProperty({ example: 'user-uuid-2' })
  updated_by: string;

  @ApiProperty({ example: '2025-10-14T12:00:00Z' })
  created_at: string;

  @ApiProperty({ example: '2025-10-14T12:00:00Z' })
  updated_at: string;
}
