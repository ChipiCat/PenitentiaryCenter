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
  status: PrisonerStatus;
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

// 🔧 Tipo específico en lugar de interface vacía
export type PrisonersCardsProps = PrisonersTableProps & {
  // Propiedades adicionales específicas para cards si las necesitas
  cardSize?: 'sm' | 'md' | 'lg';
  showPhotos?: boolean;
};

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

// Tipos adicionales útiles
export interface PrisonerFilters {
  searchTerm?: string;
  status?: PrisonerStatus | null;
  ageRange?: { min: number; max: number };
  cellBlock?: string;
  behavior?: string;
}

export interface PrisonerSortOptions {
  field: keyof Prisoner;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  total: number;
}

// Tipo para crear un nuevo prisionero (sin campos auto-generados)
export type CreatePrisonerData = Omit<Prisoner, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdate'>;

// Tipo para actualizar un prisionero existente
export type UpdatePrisonerData = Partial<Omit<Prisoner, 'id' | 'createdAt'>>;