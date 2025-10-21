import type { PrisonerSummary, PrisonerComplete, PrisonerStats } from './composed';
import type { 
  PrisonerStatus, PrisonerCategory, ViewMode 
} from './enums';
import type { 
  PrisonerFilters, CreatePrisonerData, UpdatePrisonerData
} from './operations';

export interface PrisonersTableProps {
  prisoners: PrisonerSummary[];
  totalPages: number;
  activePage: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onViewPrisoner: (id: string) => void;
  onEditPrisoner: (id: string) => void;
  onDeletePrisoner: (id: string) => Promise<void>;
  onDownloadPrisoner: (id: string, format?: 'pdf' | 'excel') => void;
}

export interface PrisonersCardsProps extends Omit<PrisonersTableProps, 'sortOptions' | 'onSortChange'> {
  cardSize?: 'sm' | 'md' | 'lg';
  showPhotos?: boolean;
  cardsPerRow?: number;
  showQuickActions?: boolean;
}

export interface PrisonersControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: PrisonerStatus | null;
  setStatusFilter: (status: PrisonerStatus | null) => void;
  categoryFilter: PrisonerCategory | null;
  setCategoryFilter: (category: PrisonerCategory | null) => void;
  buildingFilter: string | null;
  setBuildingFilter: (building: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filteredPrisoners: PrisonerSummary[];
  totalCount: number;
  onNewPrisoner: () => void;
  onExportData?: (format: 'pdf' | 'excel' | 'csv') => void;
  onAdvancedSearch?: () => void;
  isLoading?: boolean;
  isExporting?: boolean;
  canCreate?: boolean;
  canExport?: boolean;
}

export interface PrisonersFiltersProps {
  filters: PrisonerFilters;
  onFiltersChange: (filters: Partial<PrisonerFilters>) => void;
  onClearFilters: () => void;
  availableBuildings: string[];
  availableNationalities: string[];
  showAdvancedFilters?: boolean;
  isLoading?: boolean;
}

export interface PrisonerFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CreatePrisonerData>;
  prisoner?: PrisonerComplete;
  onSubmit: (data: CreatePrisonerData | UpdatePrisonerData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export interface PrisonerStepFormProps {
  currentStep: number;
  totalSteps: number;
  data: Partial<CreatePrisonerData>;
  errors: Record<string, string>;
  onDataChange: (stepData: Partial<CreatePrisonerData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => Promise<void>;
  isLoading?: boolean;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
}

export interface PrisonerProfileProps {
  prisoner: PrisonerComplete;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  onTransfer?: () => void;
  onRelease?: () => void;
  onDownload?: (format: 'pdf' | 'excel') => void;
  showActions?: boolean;
}

export interface PrisonerCardProps {
  prisoner: PrisonerSummary;
  size?: 'sm' | 'md' | 'lg';
  showPhoto?: boolean;
  showQuickActions?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  onView?: () => void;
}

export interface PrisonerStatsProps {
  stats: PrisonerStats;
  period?: 'today' | 'week' | 'month' | 'year' | 'all';
  onPeriodChange?: (period: string) => void;
  isLoading?: boolean;
  showDetails?: boolean;
  onViewDetails?: (category: string) => void;
}

export interface EmptyStateProps {
  hasFilters: boolean;
  onNewPrisoner: () => void;
  onClearFilters?: () => void;
  canCreate?: boolean;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

export interface PrisonerSearchProps {
  onSearch: (searchTerm: string) => void;
  onAdvancedSearch?: (filters: PrisonerFilters) => void;
  placeholder?: string;
  showAdvancedButton?: boolean;
  isLoading?: boolean;
  recentSearches?: string[];
}

export interface BulkActionsProps {
  selectedPrisoners: string[];
  totalSelected: number;
  onClearSelection: () => void;
  onBulkTransfer?: (targetBuilding: string, targetCell: string) => Promise<void>;
  onBulkExport?: (format: 'pdf' | 'excel' | 'csv') => void;
  onBulkDelete?: () => Promise<void>;
  onBulkStatusChange?: (status: PrisonerStatus) => Promise<void>;
  isLoading?: boolean;
}

export interface PrisonersBreadcrumbProps {
  currentPrisoner?: PrisonerSummary;
  currentSection?: string;
  showHome?: boolean;
}

export interface PrisonersLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  sidebar?: React.ReactNode;
  showStats?: boolean;
  stats?: PrisonerStats;
}

export interface FormValidationProps {
  data: Partial<CreatePrisonerData>;
  step?: number;
  onValidationChange: (isValid: boolean, errors: Record<string, string>) => void;
  realTimeValidation?: boolean;
}

export interface FieldValidationProps {
  name: string;
  value: any;
  rules: Array<{
    type: 'required' | 'email' | 'phone' | 'date' | 'custom';
    message: string;
    validator?: (value: any) => boolean;
  }>;
  onValidation: (field: string, isValid: boolean, error?: string) => void;
}