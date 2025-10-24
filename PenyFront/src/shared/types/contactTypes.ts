import type { Entity } from "./commonTypes";

export interface Contact extends Entity {
  prisoner_id: string;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  address?: string;
  is_emergency: boolean;
}

export interface CreateContactData {
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  address?: string;
  is_emergency?: boolean;
}

export interface UpdateContactData {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_emergency?: boolean;
}