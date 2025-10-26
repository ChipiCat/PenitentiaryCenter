import type { Entity } from "./commonTypes";

export interface Case extends Entity {
  crime: string;
  prisoner_id: string;
  case_number: string;
  case_type: string;
  court: string;
  judge: string;
  status: string;
  start_date: string;
  end_date?: string;
  description?: string;
  mandates?: Mandate[];
}

export interface Mandate extends Entity {
  case_id: string;
  mandate_number: string;
  mandate_type: string;
  issued_date: string;
  expiry_date?: string;
  status: string;
  description?: string;
  file_url?: string;
}

// ==================== REQUEST TYPES ====================
export interface CreateCaseData {
  case_number: string;
  case_type: string;
  court: string;
  judge: string;
  status: string;
  start_date: string;
  end_date?: string;
  description?: string;
  attachment_url?: string;
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