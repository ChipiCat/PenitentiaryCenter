export interface ActivityUser {
  id: string;
  email: string;
  name: string;
  role: string;
  //borrar
  avatar?: string; // avatar opcional
}

export interface DataChange {
  field_name?: string;
  old_value?: string;
  new_value?: string;
}

export interface ActivityLog {
  id: string;
  user: ActivityUser;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  description: string;
  status: string;
  module: string;
  severity: string;
  session_log_id?: string;
  prisoner_related_id?: string;
  metadata?: Record<string, string | number | boolean>;
  data_changes: DataChange[];
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
