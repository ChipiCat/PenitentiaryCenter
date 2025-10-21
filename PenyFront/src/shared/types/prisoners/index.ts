// Si usas la estructura dividida, importa desde operations.ts:
import type { 
  CreatePrisonerData,
  UpdatePrisonerData,
  PrisonersResponse,
  PrisonerResponse,
  PrisonerProfileResponse,
  OperationResult
} from './operations';

import type {
  PrisonerComplete,
  PrisonerSummary,
  PrisonerProfile,
  PrisonerStats,
  PrisonerIndividualStats,
  PrisonerDashboardData
} from './composed';

// Desde components.ts:
import type {
  PrisonersTableProps,
  PrisonersCardsProps,
  PrisonersControlsProps,
  PrisonerFormProps,
  PrisonerStepFormProps,
  PrisonerProfileProps,
  PrisonerCardProps,
  PrisonerStatsProps,
  EmptyStateProps,
  FormValidationProps,
} from './components';

// Exportar todo desde cada archivo
export * from './enums';
export * from './entities';
export * from './composed';
export * from './operations';
export * from './components';

//////////////////////////////////////////////////////
// RE-EXPORTS EXPLÍCITOS (Para resolver errores de importación)
//////////////////////////////////////////////////////

// Enums
export type {
  PrisonerStatus,
  CitizenshipType,
  Gender,
  MaritalStatus,
  DocumentType,
  PrisonerCategory,
  CaseStatus,
  MandateType,
  MandateStatus,
  ViewMode
} from './enums';

// Entidades
export type {
  Prisoner,
  PrisonerIdentity,
  PrisonerPersonal,
  PrisonerPenitentiary,
  PrisonerCase,
  PrisonerMandate,
  MedicalRecord,
  PrisonerBelonging,
  PrisonerContact,
  PrisonerChild
} from './entities';

// Vistas compuestas
export type {
  PrisonerComplete,
  PrisonerSummary,
  PrisonerProfile,
  PrisonerStats,
  PrisonerIndividualStats,
  PrisonerDashboardData
} from './composed';

// Operaciones (AQUÍ ESTABA EL PROBLEMA)
export type {
  CreatePrisonerData,
  UpdatePrisonerData,
  PrisonerFilters,
  PrisonerSortOptions,
  PaginationOptions,
  PrisonersResponse,
  PrisonerResponse,
  PrisonerProfileResponse,
  TransferPrisonerData,
  ReleasePrisonerData,
  AdvancedSearchFilters,
  PrisonerExportOptions,
  OperationResult
} from './operations';

// Props de componentes
export type {
  PrisonersTableProps,
  PrisonersCardsProps,
  PrisonersControlsProps,
  PrisonersFiltersProps,
  PrisonerFormProps,
  PrisonerStepFormProps,
  PrisonerProfileProps,
  PrisonerCardProps,
  PrisonerStatsProps,
  EmptyStateProps,
  PrisonerSearchProps,
  BulkActionsProps,
  PrisonersBreadcrumbProps,
  PrisonersLayoutProps,
  FormValidationProps,
  FieldValidationProps
} from './components';

//////////////////////////////////////////////////////
// TIPOS AGRUPADOS POR FUNCIONALIDAD (Opcional)
//////////////////////////////////////////////////////

// Solo mantén estos si los vas a usar, sino elimínalos
export interface PrisonerFormTypes {
  create: CreatePrisonerData;
  update: UpdatePrisonerData;
  formProps: PrisonerFormProps;
  stepProps: PrisonerStepFormProps;
  validation: FormValidationProps;
}

export interface PrisonerListTypes {
  summary: PrisonerSummary;
  tableProps: PrisonersTableProps;
  cardsProps: PrisonersCardsProps;
  controlsProps: PrisonersControlsProps;
  emptyState: EmptyStateProps;
}

export interface PrisonerDetailTypes {
  complete: PrisonerComplete;
  profile: PrisonerProfile;
  profileProps: PrisonerProfileProps;
  cardProps: PrisonerCardProps;
}

export interface PrisonerStatsTypes {
  stats: PrisonerStats;
  individual: PrisonerIndividualStats;
  dashboard: PrisonerDashboardData;
  statsProps: PrisonerStatsProps;
}

export interface PrisonerApiTypes {
  listResponse: PrisonersResponse;
  singleResponse: PrisonerResponse;
  profileResponse: PrisonerProfileResponse;
  operationResult: OperationResult;
}