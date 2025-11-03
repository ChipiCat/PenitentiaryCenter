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
import type { CaseFormData } from "./forms/legalCaseFormTypes";

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
    citizenship_type?: "Local" | "CiudadanoNacional" | "CiudadanoExtranjero";
    country_of_origin?: string;
    nationality_type?: string;
    nationality?: string;
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
  
  // Casos legales con sus mandatos (Paso 5)
  cases?: CaseFormData[];
}

export interface UpdatePrisonerData {
  registration_number: string;
  fiscal_file_number: string,
  status:  'Activo' | 'Trasladado' | 'Liberado' | 'Archivado';
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