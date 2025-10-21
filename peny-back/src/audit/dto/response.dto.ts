import {
  AuditAction,
  AuditModule,
  AuditStatus,
  AuditSeverity,
  EntityType,
} from '../../../generated/prisma';

/**
 * DTO para información de usuario en logs
 */
export class UserInfoDto {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

/**
 * DTO para un cambio de datos individual (nested en ActivityLog)
 */
export class DataChangeDetailDto {
  id: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  changed_by: string;
  changed_at: string;
  reason?: string;
}

/**
 * DTO de respuesta para un log de actividad individual (completo)
 */
export class ActivityLogResponseDto {
  id: string;

  // Usuario que realizó la acción
  user?: UserInfoDto;

  // Detalles de la acción
  action: AuditAction;
  entity_type: EntityType;
  entity_id?: string;

  // Timestamp
  timestamp: string;

  // Ubicación/contexto técnico
  ip_address?: string;
  user_agent?: string;

  // Descripción y metadata
  description: string;
  metadata?: Record<string, any>;

  // Estado
  status: AuditStatus;
  error_message?: string;

  // Contexto adicional
  module?: AuditModule;
  severity: AuditSeverity;

  // Relación con prisionero (si aplica)
  prisoner_related_id?: string;

  // Sesión asociada
  session_log_id?: string;

  // Cambios de datos asociados (si existen)
  data_changes?: DataChangeDetailDto[];
}

/**
 * DTO de respuesta para lista paginada de logs de actividad
 */
export class ActivityLogsResponseDto {
  data: ActivityLogResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * DTO para evento de timeline (actividad + cambios)
 */
export class TimelineEventDto {
  id: string;
  timestamp: string;
  action: AuditAction;
  module?: AuditModule;
  entity_type: EntityType;
  entity_id?: string;
  description: string;
  severity: AuditSeverity;
  status: AuditStatus;

  // Usuario que realizó la acción
  user?: UserInfoDto;

  // Cambios específicos
  changes?: DataChangeDetailDto[];

  // Contexto técnico
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

/**
 * DTO de respuesta para timeline completo de un prisionero
 */
export class PrisonerTimelineResponseDto {
  prisoner_id: string;
  events: TimelineEventDto[];
  summary: {
    total_events: number;
    date_range: {
      first_event: string;
      last_event: string;
    };
    actions_breakdown: Record<string, number>;
    modules_breakdown: Record<string, number>;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * DTO para historial de cambios de identidad
 */
export class IdentityChangeDto {
  id: string;
  timestamp: string;
  action: AuditAction;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  changed_by: string;
  changed_by_user?: UserInfoDto;
  description: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * DTO de respuesta para historial de identidad
 */
export class IdentityHistoryResponseDto {
  prisoner_id: string;
  entity_type: 'PRISONER_IDENTITY';
  changes: IdentityChangeDto[];
  summary: {
    total_changes: number;
    fields_modified: string[];
    date_range: {
      first_change: string;
      last_change: string;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * DTO para cambio individual de campo
 */
export class FieldChangeDto {
  id: string;
  timestamp: string;
  old_value?: string;
  new_value?: string;
  changed_by: string;
  changed_by_user?: UserInfoDto;
  reason?: string;
  action: AuditAction;
  description: string;
  ip_address?: string;
  activity_log_id?: string;
}

/**
 * DTO de respuesta para historial de un campo específico
 */
export class FieldHistoryResponseDto {
  prisoner_id: string;
  entity_type: EntityType;
  field_name: string;
  current_value?: string;
  changes: FieldChangeDto[];
  summary: {
    total_changes: number;
    date_range: {
      first_change: string;
      last_change: string;
    };
    unique_editors: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * DTO para sesión activa
 */
export class ActiveSessionDto {
  id: string;
  user: UserInfoDto;
  login_at: string;
  ip_address: string;
  user_agent: string;
  device_info?: string;
  country?: string;
  city?: string;
  duration_minutes: number;
  last_activity?: string;
  activities_count: number;
}

/**
 * DTO de respuesta para sesiones activas
 */
export class ActiveSessionsResponseDto {
  sessions: ActiveSessionDto[];
  summary: {
    total_active_sessions: number;
    users_online: number;
    by_role: Record<string, number>;
  };
}

/**
 * DTO para estadísticas generales del sistema
 */
export class SystemStatsResponseDto {
  overview: {
    total_activities: number;
    total_data_changes: number;
    total_sessions: number;
    active_sessions: number;
    unique_users: number;
    date_range: {
      first_activity: string;
      last_activity: string;
    };
  };
  activities_breakdown: {
    by_action: Record<string, number>;
    by_module: Record<string, number>;
    by_status: Record<string, number>;
    by_severity: Record<string, number>;
  };
  trends: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
  };
  top_users: Array<{
    user_id: string;
    user_email: string;
    user_name: string;
    user_role: string;
    activity_count: number;
  }>;
  error_summary: {
    total_errors: number;
    total_warnings: number;
    total_critical: number;
    by_module: Record<string, number>;
  };
}

/**
 * DTO para estadísticas de actividad de un usuario
 */
export class UserStatsResponseDto {
  user: UserInfoDto;
  overview: {
    total_activities: number;
    total_sessions: number;
    active_sessions: number;
    total_data_changes: number;
    date_range: {
      first_activity: string;
      last_activity: string;
    };
  };
  activities_breakdown: {
    by_action: Record<string, number>;
    by_module: Record<string, number>;
    by_status: Record<string, number>;
    by_entity_type: Record<string, number>;
  };
  trends: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
  };
  recent_activities: ActivityLogResponseDto[];
  sessions_summary: {
    average_session_duration_minutes: number;
    total_login_count: number;
    last_login: string;
    most_used_ip: string;
  };
}

/**
 * DTO para análisis de errores del sistema
 */
export class ErrorStatsResponseDto {
  overview: {
    total_errors: number;
    total_warnings: number;
    total_critical: number;
    date_range: {
      first_error: string;
      last_error: string;
    };
  };
  grouped_data: Record<
    string,
    {
      count: number;
      percentage: number;
      details: Array<{
        key: string;
        count: number;
        last_occurrence: string;
      }>;
    }
  >;
  top_errors: Array<{
    id: string;
    action: AuditAction;
    module?: AuditModule;
    entity_type: EntityType;
    error_message: string;
    severity: AuditSeverity;
    timestamp: string;
    user?: UserInfoDto;
    occurrence_count: number;
  }>;
  trends: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
  };
}

/**
 * DTO para resultado de búsqueda individual
 */
export class SearchResultDto {
  id: string;
  type: 'activity' | 'data_change';
  timestamp: string;
  action: AuditAction;
  module?: AuditModule;
  entity_type: EntityType;
  entity_id?: string;
  description: string;
  user?: UserInfoDto;
  severity: AuditSeverity;
  status: AuditStatus;
  matched_fields: string[];
  matched_content: {
    field: string;
    snippet: string;
  }[];
  metadata?: Record<string, any>;
  prisoner_related_id?: string;
}

/**
 * DTO de respuesta para búsqueda global
 */
export class GlobalSearchResponseDto {
  results: SearchResultDto[];
  search_meta: {
    query: string;
    searched_in: string[];
    total_results: number;
    search_time_ms: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  facets: {
    by_type: Record<string, number>;
    by_action: Record<string, number>;
    by_module: Record<string, number>;
    by_severity: Record<string, number>;
  };
}
