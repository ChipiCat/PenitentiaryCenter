// ==================== TIPOS COMUNES ====================
export * from './commonTypes';
export * from './axiosTypes';

// ==================== TIPOS DE MÓDULOS COMPLETOS ====================
export * from './userTypes';
export * from './prisonerTypes';
export * from './belongingTypes';
export * from './contactTypes';
export * from './childTypes';
export * from './identityTypes';
export * from './personalTypes';
export * from './penitentiaryTypes';
export * from './medicalRecordTypes';

// ==================== TIPOS CON POSIBLES CONFLICTOS - EXPORTS ESPECÍFICOS ====================
export type { 
  Mandate,
  CreateMandatesData,
  UpdateMandateData
} from './caseTypes'

export * from './caseTypes';
export * from './completeProfileTypes';
