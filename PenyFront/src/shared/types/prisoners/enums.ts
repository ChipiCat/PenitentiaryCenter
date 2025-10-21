// shared/types/prisoners/enums.ts

//////////////////////////////////////////////////////
// ENUMS BASADOS EN LA BASE DE DATOS
//////////////////////////////////////////////////////

export type PrisonerStatus = 'Activo' | 'Trasladado' | 'Liberado' | 'Archivado';
export type CitizenshipType = 'Local' | 'Ciudadano Nacional' | 'Ciudadano Extranjero';
export type Gender = 'Masculino' | 'Femenino' | 'Otro';
export type MaritalStatus = 'Soltero' | 'Casado' | 'Viudo' | 'Divorciado';
export type DocumentType = 'Cédula de identidad' | 'Pasaporte' | 'Otro';
export type PrisonerCategory = 'Derecho Común' | 'Prisión Preventiva' | 'Prisionero Acusado';
export type CaseStatus = 'En proceso' | 'Condenado' | 'Apelación' | 'Cerrado';
export type MandateType = 'Detención' | 'Condena' | 'Libertad' | 'Apelación' | 'Traslado';
export type MandateStatus = 'Vigente' | 'Ejecutado' | 'Anulado';
export type ViewMode = 'table' | 'cards';