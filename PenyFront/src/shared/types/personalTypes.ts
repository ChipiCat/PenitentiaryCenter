import type { Entity } from "./commonTypes";
export type Gender = 'Masculino' | 'Femenino' | 'Otro';

export interface Personal extends Entity {
  marital_status?: string;
  education_level?: string;
  occupation?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  gender?: Gender; 
  languages?: string;
  father_name?: string; 
  mother_name?: string;
  id_document_type?: string; 
  id_document_number?: string; 
}

export interface CreatePersonalData {
  gender: "Masculino" | "Femenino" | "Otro",
  father_name: string,
  mother_name: string,
  education_level: string,
  occupation: string,
  languages: string,
  marital_status: "Soltero" | "Casado" | "Viudo" | "Divorciado",
  id_document_type: "CedulaDeIdentidad" | "Pasaporte" | "Otro",
  id_document_number: string
}

export interface UpdatePersonalData {
  gender?: string;
  father_name?: string;
  mother_name?: string;
  marital_status?: string;
  education_level?: string;
  occupation?: string;
  languages?: string;
  id_document_type?: "CedulaDeIdentidad" | "Pasaporte" | "Otro",
  id_document_number?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  observations?: string;
}