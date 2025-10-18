import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { FileResponseDto } from '../../../files/dto/file.dto';

export class CreateBelongingDto {
  @ApiProperty({ example: 'Reloj de pulsera' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 'Buen estado' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  returned?: boolean;
}

export class UpdateBelongingDto {
  @ApiPropertyOptional({ example: 'Reloj de pulsera' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 'Buen estado' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  returned?: boolean;
}

export class BelongingResponseDto extends CreateBelongingDto {
  @ApiProperty({ example: 'belonging_cuid123' })
  id: string;

  @ApiProperty({ example: 'prisoner_cuid123' })
  prisoner_id: string;

  @ApiPropertyOptional({ example: 'file_cuid123' })
  file_id?: string;

  @ApiPropertyOptional({ type: () => FileResponseDto })
  file?: FileResponseDto;

  @ApiProperty({ example: 'user_cuid123' })
  created_by: string;

  @ApiProperty({ example: 'user_cuid456' })
  updated_by: string;

  @ApiProperty({ example: '2025-10-18T12:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2025-10-18T12:00:00.000Z' })
  updated_at: string;
}

export class UploadBelongingFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo de inventario (PDF)',
  })
  file: any;
}
