import type { Entity } from "./commonTypes";
import type { FileInfo } from "./filesTypes";

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
  photo_file_id?: string;
  photo_file: FileInfo | null;
  right_fingerprint_file_id?: string;
  right_fingerprint?: FileInfo | null;
  left_fingerprint_file_id?: string;
  left_fingerprint?: FileInfo | null;
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