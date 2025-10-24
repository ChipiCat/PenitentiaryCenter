import type { Entity } from "./commonTypes";

export interface MedicalRecord extends Entity {
  prisoner_id: string;
  doctor_name: string;
  examination_date: string;
  reference_number?: string;
  notes?: string;
  attachment_url?: string;
}

export interface CreateMedicalRecordData {
  doctor_name: string;
  examination_date: string;
  reference_number?: string;
  notes?: string;
}

export interface UpdateMedicalRecordData {
  doctor_name?: string;
  examination_date?: string;
  reference_number?: string;
  notes?: string;
}