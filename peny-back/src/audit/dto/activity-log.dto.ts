import { IsString, IsOptional, IsEnum, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  AuditAction, 
  AuditStatus, 
  AuditSeverity, 
  AuditModule, 
  EntityType 
} from '../../../generated/prisma';

// ============================================================
// CREATE ACTIVITY LOG DTO
// ============================================================

export class CreateActivityLogDto {
  @ApiPropertyOptional({ description: 'ID of the user who performed the action' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ description: 'Email of the user' })
  @IsOptional()
  @IsString()
  user_email?: string;

  @ApiPropertyOptional({ description: 'Name of the user' })
  @IsOptional()
  @IsString()
  user_name?: string;

  @ApiPropertyOptional({ description: 'Role of the user' })
  @IsOptional()
  @IsString()
  user_role?: string;

  @ApiProperty({ enum: AuditAction, description: 'Action performed' })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({ enum: EntityType, description: 'Type of entity affected' })
  @IsEnum(EntityType)
  entity_type: EntityType;

  @ApiPropertyOptional({ description: 'ID of the entity affected' })
  @IsOptional()
  @IsString()
  entity_id?: string;

  @ApiPropertyOptional({ description: 'IP address of the request' })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiPropertyOptional({ description: 'User agent of the request' })
  @IsOptional()
  @IsString()
  user_agent?: string;

  @ApiProperty({ description: 'Description of the action' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Additional metadata (JSON)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: AuditStatus, default: AuditStatus.SUCCESS })
  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @ApiPropertyOptional({ description: 'Error message if status is FAILED' })
  @IsOptional()
  @IsString()
  error_message?: string;

  @ApiPropertyOptional({ enum: AuditModule, description: 'Module where action occurred' })
  @IsOptional()
  @IsEnum(AuditModule)
  module?: AuditModule;

  @ApiPropertyOptional({ enum: AuditSeverity, default: AuditSeverity.INFO })
  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;

  @ApiPropertyOptional({ description: 'Session log ID if action is part of a session' })
  @IsOptional()
  @IsString()
  session_log_id?: string;
}

// ============================================================
// ACTIVITY LOG RESPONSE DTO
// ============================================================

export class ActivityLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  user_id?: string;

  @ApiPropertyOptional()
  user_email?: string;

  @ApiPropertyOptional()
  user_name?: string;

  @ApiPropertyOptional()
  user_role?: string;

  @ApiProperty({ enum: AuditAction })
  action: AuditAction;

  @ApiProperty({ enum: EntityType })
  entity_type: EntityType;

  @ApiPropertyOptional()
  entity_id?: string;

  @ApiProperty()
  timestamp: Date;

  @ApiPropertyOptional()
  ip_address?: string;

  @ApiPropertyOptional()
  user_agent?: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty({ enum: AuditStatus })
  status: AuditStatus;

  @ApiPropertyOptional()
  error_message?: string;

  @ApiPropertyOptional({ enum: AuditModule })
  module?: AuditModule;

  @ApiProperty({ enum: AuditSeverity })
  severity: AuditSeverity;

  @ApiPropertyOptional()
  session_log_id?: string;
}

// ============================================================
// QUERY DTO FOR FILTERING ACTIVITY LOGS
// ============================================================

export class ActivityLogQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  size?: number;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ enum: AuditAction, description: 'Filter by action' })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ enum: EntityType, description: 'Filter by entity type' })
  @IsOptional()
  @IsEnum(EntityType)
  entity_type?: EntityType;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsString()
  entity_id?: string;

  @ApiPropertyOptional({ enum: AuditModule, description: 'Filter by module' })
  @IsOptional()
  @IsEnum(AuditModule)
  module?: AuditModule;

  @ApiPropertyOptional({ enum: AuditSeverity, description: 'Filter by severity' })
  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;

  @ApiPropertyOptional({ enum: AuditStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}
