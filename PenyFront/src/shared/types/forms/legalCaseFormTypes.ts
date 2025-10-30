import type { CreateCaseData, CreateMandatesData } from "../caseTypes";

/**
 * Representa los datos de un mandato en el formulario
 * Extiende CreateMandatesData con un archivo temporal
 */
export interface MandateFormData extends CreateMandatesData {
  file?: File; // Archivo temporal antes de subir
  tempId?: string; // ID temporal para gestionar el formulario
}

/**
 * Representa los datos de un caso en el formulario
 * Extiende CreateCaseData con los mandatos asociados
 */
export interface CaseFormData extends CreateCaseData {
  mandates: MandateFormData[];
  tempId?: string; // ID temporal para gestionar el formulario
}

/**
 * Props para el step de casos legales
 */
export interface LegalCaseStepData {
  cases: CaseFormData[];
}
