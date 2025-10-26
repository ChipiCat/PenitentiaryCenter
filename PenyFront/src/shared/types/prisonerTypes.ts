import type { Entity } from "./commonTypes";
import type { PaginationParams } from "./axiosTypes";
import type { Personal } from "./personalTypes";
import type { Penitentiary } from "./penitentiaryTypes";
import type { Contact } from "./contactTypes";
import type { Identity } from "./identityTypes";
import type { Case } from "./caseTypes";
import type { Belonging } from "./belongingTypes";
import type { Child } from "./childTypes";
import type { MedicalRecord } from "./medicalRecordTypes";

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
  
  // Datos de identidad
  identity?: {
    surname?: string;
    first_name?: string;
    birth_date?: Date | string;
    birth_place?: string;
    residence?: string;
    citizenship_type?: string;
    country_of_origin?: string;
    nationality_type?: string;
    nationality?: string;
    profile_photo_url?: string;
    fingerprint_right_url?: string;
    fingerprint_left_url?: string;
  };
  
  // Datos personales y familiares (Paso 1)
  personal?: Partial<Personal>;
  belongings?: Partial<Belonging>[]; // Cambiado a array plural
  child?: Partial<Child>[];
  
  // Datos médicos (Paso 2)
  medical_record?: Partial<MedicalRecord>[];
  
  // Datos penitenciarios (Paso 3)
  penitentiary?: Partial<Penitentiary>;
  
  // Contactos (Paso 4)
  contacts?: Partial<Contact>[];
  
  // Datos legales (Paso 5)
  legal?: {
    case_number?: string;
    case_type?: string;
    court?: string;
    judge?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  };
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