import type { Entity } from "./commonTypes";
import type { PaginationParams } from "./axiosTypes";

export interface PrisonerBase extends Entity {
  registration_number: string;
  admission_date: string;
  fiscal_file_number?: string;
  status: 'Activo' | 'Trasladado' | 'Liberado' | 'Archivado';
}

export interface CreatePrisonerData {
  registration_number: string;
  admission_date: string;
  fiscal_file_number?: string;
  status?: string;
}

export interface UpdatePrisonerData {
  registration_number?: string;
  admission_date?: string;
  fiscal_file_number?: string;
  status?: string;
}

export interface GetPrisonersParams extends PaginationParams {
  status?: string;
  search?: string;
}
