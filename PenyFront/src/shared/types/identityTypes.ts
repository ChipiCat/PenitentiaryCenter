import type { Entity } from "./commonTypes";

// ==================== INTERFACES PRINCIPALES ====================
export interface Identity extends Entity {
  prisoner_id: string;
  first_name: string;
  surname: string;
  birth_date?: string;
  birth_place?: string;
  residence?: string;
  citizenship_type?: string;
  country_of_origin?: string;
  nationality?: string;
  photo_url?: string;
  fingerprint_right_url?: string;
  fingerprint_left_url?: string;
}

// ==================== REQUEST TYPES ====================
export interface CreateIdentityData {
  first_name: string;
  surname: string;
  birth_date?: string;
  birth_place?: string;
  residence?: string;
  citizenship_type?: string;
  country_of_origin?: string;
  nationality?: string;
}

export interface UpdateIdentityData {
  first_name?: string;
  surname?: string;
  birth_date?: string;
  birth_place?: string;
  residence?: string;
  citizenship_type?: string;
  country_of_origin?: string;
  nationality?: string;
}

// ==================== UPLOAD TYPES ====================
export type HandType = 'left' | 'right';