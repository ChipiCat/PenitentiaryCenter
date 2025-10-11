export interface Prisoner {
  id: string;
  fullName: string;
  idNumber: string;
  status: 'Activo' | 'En Proceso' | 'Liberado';
  createdAt: string;
  updatedAt: string;
  // Campos adicionales opcionales para cuando expandas la funcionalidad
  admissionDate?: string;
  age?: number;
  crime?: string;
  sentence?: string;
  cellBlock?: string;
  emergencyContact?: string;
}

export type PrisonerStatus = Prisoner['status'];

export interface PrisonerFilters {
  searchTerm: string;
  statusFilter: string | null;
}