import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'María López' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Madre' })
  @IsString()
  relationship: string;

  @ApiProperty({ example: '+52 123 456 7890' })
  @IsString()
  phone: string;
}

export class UpdateContactDto {
  @ApiPropertyOptional({ example: 'María López' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Madre' })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional({ example: '+52 123 456 7890' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class ContactResponseDto extends CreateContactDto {
  @ApiProperty({ example: 'contact_cuid123' })
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
