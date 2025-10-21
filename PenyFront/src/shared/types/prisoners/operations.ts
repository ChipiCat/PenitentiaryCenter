import type { PrisonerSummary, PrisonerComplete, PrisonerProfile } from './composed';
import type { 
  Prisoner, PrisonerIdentity, PrisonerPersonal, PrisonerPenitentiary 
} from './entities';
import type { 
  PrisonerStatus, PrisonerCategory, CaseStatus, CitizenshipType,
  Gender, MaritalStatus, DocumentType
} from './enums';

export interface CreatePrisonerData {
  registration_number: string;
  admission_date: Date;
  fiscal_file_number: string;
  
  identity: {
    surname: string;
    first_name: string;
    birth_date?: Date;
    birth_place?: string;
    residence?: string;
    citizenship_type?: CitizenshipType;
    country_of_origin?: string;
    nationality_type?: string;
    nationality?: string;
  };
  
  personal?: {
    gender?: Gender;
    father_name?: string;
    mother_name?: string;
    education_level?: string;
    occupation?: string;
    languages?: string;
    marital_status?: MaritalStatus;
    id_document_type?: DocumentType;
    id_document_number?: string;
  };
  
  penitentiary?: {
    category?: PrisonerCategory;
    building_number?: string;
    cell_number?: string;
    bed_number?: string;
  };
  
  contacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  
  initialCase?: {
    case_number: string;
    crime: string;
    court_name?: string;
    judge_name?: string;
    start_date?: Date;
  };
}

export interface UpdatePrisonerFormData {
  registration_number?: string;
  admission_date?: Date;
  fiscal_file_number?: string;
  
  identity?: {
    surname?: string;
    first_name?: string;
    birth_date?: Date;
    birth_place?: string;
    residence?: string;
    citizenship_type?: CitizenshipType;
    country_of_origin?: string;
    nationality_type?: string;
    nationality?: string;
  };
  
  personal?: {
    gender?: Gender;
    father_name?: string;
    mother_name?: string;
    education_level?: string;
    occupation?: string;
    languages?: string;
    marital_status?: MaritalStatus;
    id_document_type?: DocumentType;
    id_document_number?: string;
  };
  
  penitentiary?: {
    category?: PrisonerCategory;
    building_number?: string;
    cell_number?: string;
    bed_number?: string;
  };
  
  contacts?: Array<{
    name?: string;
    relationship?: string;
    phone?: string;
  }>;
  
  initialCase?: {
    case_number?: string;
    crime?: string;
    court_name?: string;
    judge_name?: string;
    start_date?: Date;
  };
}

export interface UpdatePrisonerData {
  prisoner?: Partial<Omit<Prisoner, 'id' | 'created_at' | 'created_by'>>;
  identity?: Partial<Omit<PrisonerIdentity, 'id' | 'prisoner_id' | 'created_at' | 'created_by'>>;
  personal?: Partial<Omit<PrisonerPersonal, 'id' | 'prisoner_id' | 'created_at' | 'created_by'>>;
  penitentiary?: Partial<Omit<PrisonerPenitentiary, 'id' | 'prisoner_id' | 'created_at' | 'created_by'>>;
}

export interface PrisonerFilters {
  searchTerm?: string;
  status?: PrisonerStatus | null;
  category?: PrisonerCategory | null;
  caseStatus?: CaseStatus | null;
  building?: string;
  cell?: string;
  admissionDateRange?: {
    start: Date;
    end: Date;
  };
  birthDateRange?: {
    start: Date;
    end: Date;
  };
  gender?: Gender | null;
  nationality?: string;
  maritalStatus?: MaritalStatus | null;
  hasPhoto?: boolean;
  hasMedicalRecords?: boolean;
  hasEmergencyContact?: boolean;
  hasActiveCases?: boolean;
  riskLevel?: 'low' | 'medium' | 'high' | null;
}

export interface PrisonerSortOptions {
  field: keyof PrisonerSummary | 'admission_date' | 'full_name' | 'age';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  total: number;
}

export interface PrisonersResponse {
  data: PrisonerSummary[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters?: PrisonerFilters;
  sorting?: PrisonerSortOptions;
  metadata?: {
    totalActive: number;
    totalInactive: number;
    averageAge: number;
    mostCommonCrime: string;
  };
}

export interface PrisonerResponse {
  data: PrisonerComplete;
  metadata?: {
    last_modified: Date;
    modification_count: number;
    has_pending_changes: boolean;
  };
}

export interface PrisonerProfileResponse {
  data: PrisonerProfile;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canViewMedicalRecords: boolean;
    canViewLegalDocuments: boolean;
  };
}

export interface TransferPrisonerData {
  prisoner_id: string;
  new_building_number: string;
  new_cell_number: string;
  new_bed_number?: string;
  transfer_reason: string;
  transfer_date: Date;
  authorized_by: string;
  notes?: string;
}

export interface ReleasePrisonerData {
  prisoner_id: string;
  release_date: Date;
  release_type: 'Cumplimiento de condena' | 'Libertad condicional' | 'Indulto' | 'Otro';
  release_reason?: string;
  authorized_by: string;
  court_order_number?: string;
  notes?: string;
}

export interface AdvancedSearchFilters extends PrisonerFilters {
  crimeKeywords?: string[];
  courtName?: string;
  judgeName?: string;
  sentenceYearsRange?: {
    min: number;
    max: number;
  };
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  hasAllergies?: boolean;
  hasMedications?: boolean;
  doctorName?: string;
  hasPersonalBelongings?: boolean;
  belongingDescription?: string;
}

export interface PrisonerExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includePhotos?: boolean;
  includePersonalData?: boolean;
  includeLegalData?: boolean;
  includeMedicalData?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: PrisonerFilters;
}

export interface OperationResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}