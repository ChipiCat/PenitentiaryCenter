import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateChildDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  full_name: string;

  @ApiPropertyOptional({ example: '2010-05-15' })
  @IsOptional()
  @IsDateString()
  birth_date?: string;
}

export class UpdateChildDto {
  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: '2010-05-15' })
  @IsOptional()
  @IsDateString()
  birth_date?: string;
}

export class ChildResponseDto extends CreateChildDto {
  @ApiProperty({ example: 'child_cuid123' })
  id: string;

  @ApiProperty({ example: 'prisoner_cuid123' })
  prisoner_id: string;

  @ApiProperty({ example: 'user_cuid123' })
  created_by: string;

  @ApiProperty({ example: 'user_cuid456' })
  updated_by: string;

  @ApiProperty({ example: '2025-10-18T12:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2025-10-18T12:00:00.000Z' })
  updated_at: string;
}
