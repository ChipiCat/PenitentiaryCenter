import type { Entity } from "./commonTypes";
import type { PaginationParams } from "./axiosTypes";
import type { Personal } from "./personalTypes";
import type { Penitentiary } from "./penitentiaryTypes";
import type { Contact } from "./contactTypes";
import type { Identity } from "./identityTypes";
import type { Case } from "./caseTypes";

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

  personal?: Partial<Personal>;
  penitentiary?: Partial<Penitentiary>;
  contacts?: Partial<Contact>[];
}

export interface UpdatePrisonerData {
  registration_number?: string;
  admission_date?: string;
  fiscal_file_number?: string;
  status?: string;

  personal?: Personal;
  penitentiary?: Penitentiary;
  contacts?: Contact[];
}

export interface GetPrisonersParams extends PaginationParams {
  status?: string;
  search?: string;
}

export interface PrisionerListItem  {
  prisoner: PrisonerBase;
  identity: Identity;
  cases: Case[];
  penitentiary: Penitentiary;
}