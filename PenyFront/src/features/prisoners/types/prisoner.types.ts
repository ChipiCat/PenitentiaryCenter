// Tipos específicos para status
export type PrisonerStatus = 'Activo' | 'Inactivo' | 'En Proceso' | 'Liberado' | 'Transferido';

// Tipo principal de Prisoner
export interface Prisoner {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  idNumber: string;
  age: number;
  identification?: string;
  passport?: string;
  birthDate?: string;
  gender?: string;
  nationality?: string;
  crime?: string;
  sentence?: string;
  cellBlock?: string;
  legalStatus?: string;
  behavior?: string;
  workAssignment?: string;
  status: PrisonerStatus; // 🔧 Usar union type específico
  admissionDate?: string;
  remainingSentence?: string;
  createdAt: string;
  updatedAt: string;
  lastUpdate: string;
  photo?: string;
  
  // Información de contacto (opcional)
  emergencyContact?: string;
  emergencyPhone?: string;
  relationship?: string;
  location?: {
    department?: string;
    city?: string;
    address?: string;
  };
  
  // Información médica (opcional)
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    lastCheckup?: string;
  };
}

// Estadísticas de reclusos
export interface PrisonerStats {
  total: number;
  active: number;
  inProcess: number;
  released: number;
}

// Props para componentes de tabla y tarjetas
export interface PrisonersTableProps {
  prisoners: Prisoner[];
  totalPages: number;
  activePage: number;
  onPageChange: (page: number) => void;
  onViewPrisoner: (id: string) => void;
  onEditPrisoner: (id: string) => void;
  onDeletePrisoner: (id: string) => Promise<void>;
  onDownloadPrisoner: (id: string, format?: 'pdf' | 'excel') => void;
}

export interface PrisonersCardsProps extends PrisonersTableProps {
  // Mismo tipo que PrisonersTableProps
}

// Props para controles
export interface PrisonersControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filteredPrisoners: Prisoner[];
  onNewPrisoner: () => void;
}

// Props para estado vacío
export interface EmptyStateProps {
  hasFilters: boolean;
  onNewPrisoner: () => void;
}

// Tipos para modos de vista
export type ViewMode = 'table' | 'cards';