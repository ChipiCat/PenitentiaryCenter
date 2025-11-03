export interface ActivityUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface DataChange {
  field?: string;
  key?: string;
  old_value?: string;
  oldValue?: string;
  new_value?: string;
  newValue?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  module: string;
  entity_type: string;
  entity_id: string;
  description: string;
  severity: string;
  status: string;
  user: ActivityUser;
  changes: DataChange[];
  ip_address: string;
  user_agent: string;
  session_log_id?: string;
  prisoner_related_id?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ActivityLogsPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ActivityLogsResponse {
  data: ActivityLog[];
  pagination: ActivityLogsPagination;
}

export type ActionType = 'login' | 'create' | 'update' | 'export' | 'delete' | 'view' | 'print';

export interface Statistics {
  total: number;
  activos: number;
  trasladados: number;
  liberados: number;
  archivados: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}