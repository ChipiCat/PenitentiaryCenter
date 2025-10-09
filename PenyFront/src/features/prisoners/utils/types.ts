export interface Prisoner {
  id: string;
  fullName: string;
  idNumber: string;
  status: 'Activo' | 'En Proceso' | 'Liberado';
  createdAt: string;
  updatedAt: string;
}

export type PrisonerStatus = 'Activo' | 'En Proceso' | 'Liberado';
export type ViewMode = 'table' | 'cards';