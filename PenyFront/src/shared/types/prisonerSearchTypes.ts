/**
 * Types for Prisoner Search functionality
 * Matching backend DTOs: SearchFiltersDto and SearchPrisonerQueryDto
 */

import type { PrisonerStatus, CitizenshipType, MaritalStatus } from './commonTypes';
import type { Gender } from './personalTypes';

// ==================== ENUMS ====================

export type PrisonerCategory = 'DerechoComun' | 'PrisionPreventiva' | 'PrisioneroAcusado';

export type OrderByField = 
  | 'registrationNumber'
  | 'admissionDate'
  | 'surname'
  | 'firstName'
  | 'createdAt'
  | 'updatedAt';

export type OrderDirection = 'asc' | 'desc';

// ==================== FILTER TYPES ====================

/**
 * Search filters for prisoner search
 * Matches backend SearchFiltersDto
 */
export interface PrisonerSearchFilters {
  /** Estado del prisionero */
  status?: PrisonerStatus;
  
  /** Género */
  gender?: Gender;
  
  /** Estado civil */
  maritalStatus?: MaritalStatus;
  
  /** Categoría penitenciaria */
  category?: PrisonerCategory;
  
  /** Tipo de ciudadanía */
  citizenshipType?: CitizenshipType;
  
  /** Fecha de admisión desde (ISO 8601: YYYY-MM-DD) */
  admissionDateFrom?: string;
  
  /** Fecha de admisión hasta (ISO 8601: YYYY-MM-DD) */
  admissionDateTo?: string;
  
  /** Número de edificio */
  buildingNumber?: string;
  
  /** Número de celda */
  cellNumber?: string;
  
  /** País de origen */
  countryOfOrigin?: string;
  
  /** Nacionalidad */
  nationality?: string;
}

// ==================== QUERY TYPES ====================

/**
 * Query parameters for prisoner search endpoint
 * Matches backend SearchPrisonerQueryDto
 */
export interface PrisonerSearchQuery {
  /** Número de página (empieza en 1) */
  page?: number;
  
  /** Cantidad de resultados por página (1-100) */
  limit?: number;
  
  /** Texto de búsqueda en múltiples campos */
  query?: string;
  
  /** Filtros avanzados */
  filters?: PrisonerSearchFilters;
  
  /** Incluir registros eliminados (soft delete) */
  includeDeleted?: boolean;
  
  /** Campo de ordenamiento */
  orderBy?: OrderByField;
  
  /** Dirección del ordenamiento */
  orderDirection?: OrderDirection;
}

// ==================== RESPONSE TYPES ====================

/**
 * Prisoner profile in search results
 */
export interface SearchPrisonerProfile {
  prisoner: {
    id: string;
    registration_number: string;
    admission_date: string;
    fiscal_file_number?: string;
    status: PrisonerStatus;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
  };
  identity?: {
    surname: string;
    first_name: string;
    birth_date?: string;
    birth_place?: string;
    residence?: string;
    citizenship_type?: CitizenshipType;
    country_of_origin?: string;
    nationality?: string;
    photo_url?: string;
  };
  personal?: {
    gender?: Gender;
    father_name?: string;
    mother_name?: string;
    education_level?: string;
    occupation?: string;
    languages?: string;
    marital_status?: MaritalStatus;
    id_document_type?: string;
    id_document_number?: string;
  };
  penitentiary?: {
    category?: PrisonerCategory;
    building_number?: string;
    cell_number?: string;
    bed_number?: string;
  };
  cases: Array<{
    id: string;
    case_number: string;
    crime: string;
    sentence?: string;
    start_date: string;
    end_date?: string;
    status: string;
    court?: string;
  }>;
}

/**
 * Search response with pagination
 */
export interface PrisonerSearchResponse {
  data: SearchPrisonerProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchInfo?: {
    searchQuery?: string;
    filtersApplied?: string[];
  };
}

// ==================== UTILITY TYPES ====================

/**
 * Type guard to check if a value is a valid PrisonerStatus
 */
export const isPrisonerStatus = (value: string): value is PrisonerStatus => {
  return ['Activo', 'Trasladado', 'Liberado', 'Archivado'].includes(value);
};

/**
 * Type guard to check if a value is a valid Gender
 */
export const isGender = (value: string): value is Gender => {
  return ['Masculino', 'Femenino', 'Otro'].includes(value);
};

/**
 * Type guard to check if a value is a valid MaritalStatus
 */
export const isMaritalStatus = (value: string): value is MaritalStatus => {
  return ['Soltero', 'Casado', 'Viudo', 'Divorciado', 'Unión Libre'].includes(value);
};

/**
 * Type guard to check if a value is a valid PrisonerCategory
 */
export const isPrisonerCategory = (value: string): value is PrisonerCategory => {
  return ['DerechoComun', 'PrisionPreventiva', 'PrisioneroAcusado'].includes(value);
};

/**
 * Type guard to check if a value is a valid CitizenshipType
 */
export const isCitizenshipType = (value: string): value is CitizenshipType => {
  return ['Local', 'CiudadanoNacional', 'CiudadanoExtranjero'].includes(value);
};
