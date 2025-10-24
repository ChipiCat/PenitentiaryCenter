import type { Entity } from "./commonTypes";

export interface Child extends Entity {
  prisoner_id: string;
  name: string;
  birth_date?: string;
  gender?: string;
  custody_status?: string;
  guardian_name?: string;
  guardian_contact?: string;
}

export interface CreateChildData {
  name: string;
  birth_date?: string;
  gender?: string;
  custody_status?: string;
  guardian_name?: string;
  guardian_contact?: string;
}

export interface UpdateChildData {
  name?: string;
  birth_date?: string;
  gender?: string;
  custody_status?: string;
  guardian_name?: string;
  guardian_contact?: string;
}