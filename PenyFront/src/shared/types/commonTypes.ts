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

export type PeriodType = "week" | "month" | "year" | "today";
