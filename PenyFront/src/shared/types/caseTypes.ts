import type { Entity } from "./commonTypes";
import type { FileInfo } from "./filesTypes";

export interface Case extends Entity {
 prisoner_id:string,
  case_number: string,
  crime: string,
  status: "EnProceso" | "Condenado" | "Apelacion" | "Cerrado";
  start_date: string,
  end_date: string,
  court_name: string,
  judge_name: string,
  sentence_years: number,
  remarks: string,
}

export interface Mandate extends Entity {
  case_id: string;
  type: "Detencion" | "Condena" | "Libertad" | "Apelacion" | "Traslado";
  issue_date: string;
  file_id?: string;
  file: FileInfo | null;
  description?: string;
  status: 'Vigente' | 'Ejecutado' | 'Anulado';
}

// ==================== REQUEST TYPES ====================
export interface CreateCaseData {
  case_number: string;
  crime: string;
  status: string;
  start_date: string;
  end_date?: string;
  court_name: string;
  judge_name: string;
  sentence_years: number;
  remarks?: string;
}

export interface CreateMandatesData {
  type: 'Detencion' | 'Condena' | 'Libertad' | 'Apelacion' | 'Traslado';
  issue_date: string;
  description?: string;
  status: 'Vigente' | 'Ejecutado' | 'Anulado';
}

export interface UpdateCaseData {
  case_number?: string;
  case_type?: string;
  court?: string;
  judge?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

// ==================== RESPONSE TYPES ====================
export interface CasesCompleteResponse {
  cases: Case[];
  total_mandates: number;
  active_mandates: number;
}

export interface GetCasesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}