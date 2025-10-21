// shared/types/prisoners/composed.ts
import type { 
  Prisoner, PrisonerIdentity, PrisonerPersonal, PrisonerPenitentiary,
  PrisonerCase, PrisonerMandate, MedicalRecord, PrisonerBelonging,
  PrisonerContact, PrisonerChild
} from './entities';
import type { PrisonerStatus, CaseStatus } from './enums';

//////////////////////////////////////////////////////
// INTERFACES COMPUESTAS (Para vistas completas)
//////////////////////////////////////////////////////

// Prisionero completo con todas sus relaciones
export interface PrisonerComplete {
  prisoner: Prisoner;
  identity: PrisonerIdentity;
  personal: PrisonerPersonal;
  penitentiary: PrisonerPenitentiary;
  cases: PrisonerCase[];
  mandates: PrisonerMandate[];
  medicalRecords: MedicalRecord[];
  belongings: PrisonerBelonging[];
  contacts: PrisonerContact[];
  children: PrisonerChild[];
}

// Vista simplificada para listas y tarjetas
export interface PrisonerSummary {
  id: string;
  registration_number: string;
  full_name: string; // Computed: first_name + surname
  status: PrisonerStatus;
  admission_date: Date;
  photo_url?: string;
  building_number?: string;
  cell_number?: string;
  bed_number?: string;
  primary_crime?: string; // Del caso principal
  case_status?: CaseStatus;
  age?: number; // Computed from birth_date
  time_served?: string; // Computed: admission_date to now
}

// Vista para perfiles de prisionero
export interface PrisonerProfile {
  // Datos básicos
  id: string;
  registration_number: string;
  admission_date: Date;
  fiscal_file_number: string;
  status: PrisonerStatus;
  
  // Identidad
  full_name: string;
  surname: string;
  first_name: string;
  birth_date?: Date;
  birth_place?: string;
  nationality?: string;
  photo_url?: string;
  
  // Información personal
  gender?: string;
  father_name?: string;
  mother_name?: string;
  marital_status?: string;
  education_level?: string;
  occupation?: string;
  
  // Ubicación penitenciaria
  category?: string;
  building_number?: string;
  cell_number?: string;
  bed_number?: string;
  
  // Información legal resumida
  total_cases: number;
  active_cases: number;
  primary_crime?: string;
  sentence_years?: number;
  
  // Contactos principales
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  // Estadísticas médicas
  medical_records_count: number;
  last_medical_check?: Date;
  
  // Metadatos
  created_at: Date;
  updated_at: Date;
}

//////////////////////////////////////////////////////
// ESTADÍSTICAS Y MÉTRICAS
//////////////////////////////////////////////////////

export interface PrisonerStats {
  // Totales generales
  total: number;
  active: number;
  transferred: number;
  released: number;
  archived: number;
  
  // Por categoría penitenciaria
  byCategory: {
    derechoComun: number;
    prisionPreventiva: number;
    prisioneroAcusado: number;
  };
  
  // Por estado de casos
  byCaseStatus: {
    enProceso: number;
    condenado: number;
    apelacion: number;
    cerrado: number;
  };
  
  // Por género
  byGender: {
    masculino: number;
    femenino: number;
    otro: number;
  };
  
  // Por rangos de edad
  byAgeRange: {
    bajo18: number;
    entre18y25: number;
    entre26y35: number;
    entre36y50: number;
    sobre50: number;
  };
  
  // Estadísticas temporales
  newAdmissionsThisMonth: number;
  newAdmissionsThisYear: number;
  averageTimeServed: number; // en días
  
  // Estadísticas por edificio
  byBuilding: Array<{
    building_number: string;
    count: number;
    capacity?: number;
    occupancy_rate?: number;
  }>;
}

// Estadísticas específicas para un prisionero
export interface PrisonerIndividualStats {
  prisoner_id: string;
  days_served: number;
  total_cases: number;
  active_cases: number;
  medical_records_count: number;
  belongings_count: number;
  children_count: number;
  emergency_contacts_count: number;
  last_activity_date?: Date;
  behavior_score?: number; // Si se implementa sistema de comportamiento
}

// Resumen para dashboards
export interface PrisonerDashboardData {
  stats: PrisonerStats;
  recent_admissions: PrisonerSummary[];
  pending_releases: PrisonerSummary[];
  medical_alerts: Array<{
    prisoner_id: string;
    prisoner_name: string;
    alert_type: string;
    priority: 'low' | 'medium' | 'high';
    date: Date;
  }>;
  capacity_alerts: Array<{
    building_number: string;
    current_count: number;
    capacity: number;
    alert_level: 'warning' | 'critical';
  }>;
}