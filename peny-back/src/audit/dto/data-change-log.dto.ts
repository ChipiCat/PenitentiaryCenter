import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityType } from '../../../generated/prisma';

// ============================================================
// CREATE DATA CHANGE LOG DTO
// ============================================================

export class CreateDataChangeLogDto {
  @ApiPropertyOptional({ description: 'ID of the activity log this change belongs to' })
  @IsOptional()
  @IsString()
  activity_log_id?: string;

  @ApiProperty({ enum: EntityType, description: 'Type of entity that changed' })
  @IsEnum(EntityType)
  entity_type: EntityType;

  @ApiProperty({ description: 'ID of the entity that changed' })
  @IsString()
  entity_id: string;

  @ApiProperty({ description: 'Name of the field that changed' })
  @IsString()
  field_name: string;

  @ApiPropertyOptional({ description: 'Old value before change' })
  @IsOptional()
  @IsString()
  old_value?: string;

  @ApiPropertyOptional({ description: 'New value after change' })
  @IsOptional()
  @IsString()
  new_value?: string;

  @ApiProperty({ description: 'ID of user who made the change' })
  @IsString()
  changed_by: string;

  @ApiPropertyOptional({ description: 'Reason for the change' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// ============================================================
// DATA CHANGE LOG RESPONSE DTO
// ============================================================

export class DataChangeLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  activity_log_id?: string;

  @ApiProperty({ enum: EntityType })
  entity_type: EntityType;

  @ApiProperty()
  entity_id: string;

  @ApiProperty()
  field_name: string;

  @ApiPropertyOptional()
  old_value?: string;

  @ApiPropertyOptional()
  new_value?: string;

  @ApiProperty()
  changed_by: string;

  @ApiProperty()
  changed_at: Date;

  @ApiPropertyOptional()
  reason?: string;
}

// ============================================================
// QUERY DTO FOR FILTERING DATA CHANGE LOGS
// ============================================================

export class DataChangeLogQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  size?: number;

  @ApiPropertyOptional({ description: 'Filter by activity log ID' })
  @IsOptional()
  @IsString()
  activity_log_id?: string;

  @ApiPropertyOptional({ enum: EntityType, description: 'Filter by entity type' })
  @IsOptional()
  @IsEnum(EntityType)
  entity_type?: EntityType;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsString()
  entity_id?: string;

  @ApiPropertyOptional({ description: 'Filter by field name' })
  @IsOptional()
  @IsString()
  field_name?: string;

  @ApiPropertyOptional({ description: 'Filter by user who made the change' })
  @IsOptional()
  @IsString()
  changed_by?: string;
}
