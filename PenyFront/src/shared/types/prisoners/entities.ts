import type { 
  PrisonerStatus, CitizenshipType, Gender, MaritalStatus, 
  DocumentType, PrisonerCategory, CaseStatus, MandateType, MandateStatus 
} from './enums';

export interface Prisoner {
  id: string;
  registration_number: string;
  admission_date: Date;
  fiscal_file_number: string;
  status: PrisonerStatus;
  isDeleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PrisonerIdentity {
  id: string;
  prisoner_id: string;
  photo_url?: string;
  right_hand_fingerprint_url?: string;
  left_hand_fingerprint_url?: string;
  surname: string;
  first_name: string;
  birth_date?: Date;
  birth_place?: string;
  residence?: string;
  citizenship_type?: CitizenshipType;
  country_of_origin?: string;
  nationality_type?: string;
  nationality?: string;
  isDeleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PrisonerPersonal {
  id: string;
  prisoner_id: string;
  gender?: Gender;
  father_name?: string;
  mother_name?: string;
  education_level?: string;
  occupation?: string;
  languages?: string;
  marital_status?: MaritalStatus;
  id_document_type?: DocumentType;
  id_document_number?: string;
  isDeleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PrisonerPenitentiary {
  id: string;
  prisoner_id: string;
  category?: PrisonerCategory;
  building_number?: string;
  cell_number?: string;
  bed_number?: string;
  isDeleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PrisonerCase {
  id: string;
  prisoner_id: string;
  case_number: string;
  crime: string;
  status: CaseStatus;
  start_date?: Date;
  end_date?: Date;
  court_name?: string;
  judge_name?: string;
  sentence_years?: number;
  remarks?: string;
  isDeleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PrisonerMandate {
  id: string;
  case_id: string;
  type: MandateType;
  issue_date: Date;
  document_url?: string;
  description?: string;
  status: MandateStatus;
  isDeleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface MedicalRecord {
  id: string;
  prisoner_id: string;
  doctor_name?: string;
  examination_date?: Date;
  reference_number?: string;
  file_path?: string;
  notes?: string;
  isDeleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PrisonerBelonging {
  id: string;
  prisoner_id: string;
  description: string;
  quantity: number;
  condition?: string;
  returned: boolean;
  file_path?: string;
  isDeleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PrisonerContact {
  id: string;
  prisoner_id: string;
  name: string;
  relationship: string;
  phone: string;
  isDeleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PrisonerChild {
  id: string;
  prisoner_id: string;
  full_name: string;
  birth_date?: Date;
  isDeleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}