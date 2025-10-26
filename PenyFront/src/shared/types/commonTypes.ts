export interface Entity {
  id: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export type Status = "Activo" | "Inactivo" | "Pendiente" | "Archivado";
export type PrisonerStatus = "Activo" | "Trasladado" | "Liberado" | "Archivado";

export interface BaseFilters {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface AuditInfo {
  created_by?: string;
  updated_by?: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface FileInfo {
  url: string;
  filename: string;
  size: number;
  mime_type?: string;
  uploaded_at: string;
}

export type CitizenshipType =
  | "Local"
  | "Ciudadano Nacional"
  | "Ciudadano Extranjero";

export type MaritalStatus =
  | "Soltero"
  | "Casado"
  | "Divorciado"
  | "Viudo"
  | "Unión Libre";
  
export type EducationLevel =
  | "Sin Educación"
  | "Primaria Incompleta"
  | "Primaria Completa"
  | "Secundaria Incompleta"
  | "Secundaria Completa"
  | "Técnico";

export interface ActivityUser {
  id: string;
  name: string;
  email?: string;
  role?: string; 
  avatar?: string;
}

export interface SystemActivity {
  id: string;
  action: string;
  user: ActivityUser;
  target: string;
  timestamp: string;
}

export type PeriodType = "week" | "month" | "year" | "today";
