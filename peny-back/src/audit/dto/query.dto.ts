import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AuditAction,
  AuditModule,
  AuditStatus,
  AuditSeverity,
  EntityType,
} from '../../../generated/prisma';

/**
 * DTO para consultar logs de actividad con filtros avanzados
 */
export class ActivityLogsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  // Filtros por usuario
  @IsOptional()
  user_id?: string;

  @IsOptional()
  user_email?: string;

  @IsOptional()
  user_role?: string;

  // Filtros por acción y módulo
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsEnum(AuditModule)
  module?: AuditModule;

  // Filtros por entidad
  @IsOptional()
  @IsEnum(EntityType)
  entity_type?: EntityType;

  @IsOptional()
  entity_id?: string;

  // Filtro por prisionero relacionado
  @IsOptional()
  prisoner_related_id?: string;

  // Filtros por estado y severidad
  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;

  // Filtros por fecha
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  // Filtros por sesión
  @IsOptional()
  session_log_id?: string;

  // Búsqueda de texto
  @IsOptional()
  search?: string;

  // IP Address
  @IsOptional()
  ip_address?: string;
}

/**
 * DTO para consultar historial de cambios de campo específico
 */
export class FieldHistoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsDateString()
  changed_by?: string;
}

/**
 * DTO para consultar estadísticas de errores del sistema
 */
export class ErrorStatsQueryDto {
  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['action', 'module', 'user'])
  groupBy?: 'action' | 'module' | 'user';
}

/**
 * DTO para búsqueda global en logs
 */
export class GlobalSearchQueryDto {
  @IsOptional()
  q?: string; // Término de búsqueda

  @IsOptional()
  searchIn?: ('description' | 'metadata' | 'userEmail')[];

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsEnum(AuditModule)
  module?: AuditModule;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}

export class PrisonerTimelineQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  module?: string;
}
