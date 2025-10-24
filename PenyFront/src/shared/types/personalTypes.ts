import type { Entity } from "./commonTypes";
export type Gender = 'Masculino' | 'Femenino' | 'Otro';

export interface Personal extends Entity {
  marital_status?: string;
  education_level?: string;
  occupation?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  observations?: string;
  gender?: Gender; 
  father_name?: string; 
  mother_name?: string;
  id_document_type?: string; 
  id_document_number?: string; 
}

export interface CreatePersonalData {
  marital_status?: string;
  education_level?: string;
  occupation?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  observations?: string;
}

export interface UpdatePersonalData {
  marital_status?: string;
  education_level?: string;
  occupation?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  observations?: string;
}