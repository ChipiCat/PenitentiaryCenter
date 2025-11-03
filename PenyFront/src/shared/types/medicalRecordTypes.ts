import type { Entity } from "./commonTypes";
import type { FileInfo } from "./filesTypes";

export interface MedicalRecord extends Entity {
  prisoner_id: string;
  doctor_name: string;
  examination_date: string;
  reference_number?: string;
  notes?: string;
  file_id?: string;
  file: FileInfo | null;
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