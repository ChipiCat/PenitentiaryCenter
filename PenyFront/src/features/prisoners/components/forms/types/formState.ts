/**
 * Tipos para el estado y seguimiento de cambios del formulario de prisioneros
 */

import type { CreatePrisonerData } from '../../../../../shared/types';

/**
 * Representa qué secciones han sido modificadas
 */
export interface DirtyState {
  prisoner: boolean;       // Datos básicos del prisionero
  identity: boolean;       // Información de identidad
  personal: boolean;       // Información personal
  medical: boolean;        // Registros médicos
  penitentiary: boolean;   // Ubicación penitenciaria
  contacts: boolean;       // Contactos
  cases: boolean;          // Casos legales
  files: boolean;          // Archivos (foto, huellas)
}

/**
 * Archivos para subir
 * Se usan los nombres oficiales sin sufijo "File"
 */
export interface FormFiles {
  photo?: File;
  fingerprintLeft?: File;
  fingerprintRight?: File;
}

/**
 * Estado del formulario con seguimiento de cambios
 */
export interface FormState {
  data: Partial<CreatePrisonerData>;
  files: FormFiles;
  dirty: DirtyState;
  errors: Record<string, string>;
}

/**
 * Resultado de una actualización de sección
 */
export interface SectionUpdateResult {
  success: boolean;
  sectionName: string;
  error?: string;
}

/**
 * Configuración para el modo de edición
 */
export interface EditModeConfig {
  prisonerId: string;
  initialData: Partial<CreatePrisonerData>;
}
