import type { Entity } from "./commonTypes";

export interface Personal extends Entity {
  prisoner_id: string;
  marital_status?: string;
  education_level?: string;
  occupation?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  observations?: string;
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