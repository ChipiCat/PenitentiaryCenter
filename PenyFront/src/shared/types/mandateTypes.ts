import type { Entity } from "./commonTypes";

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

export interface CreateMandateData {
  mandate_number: string;
  mandate_type: string;
  issued_date: string;
  expiry_date?: string;
  status: string;
  description?: string;
}

export interface UpdateMandateData {
  mandate_number?: string;
  mandate_type?: string;
  issued_date?: string;
  expiry_date?: string;
  status?: string;
  description?: string;
}