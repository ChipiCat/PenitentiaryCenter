/**
 * Utilidades para detectar cambios entre datos originales y modificados
 */

import type { CreatePrisonerData } from '../../../../../shared/types';
import type { DirtyState } from '../types/formState';

/**
 * Compara dos objetos y retorna true si son diferentes
 */
function hasObjectChanged<T extends Record<string, unknown>>(
  original: T | undefined,
  current: T | undefined
): boolean {
  // Si ambos son undefined, no hay cambios
  if (!original && !current) return false;
  
  // Si solo uno es undefined, hay cambios
  if (!original || !current) return true;

  // Comparar cada propiedad
  const allKeys = new Set([...Object.keys(original), ...Object.keys(current)]);
  
  for (const key of allKeys) {
    const originalValue = original[key];
    const currentValue = current[key];
    
    // Comparación profunda para objetos y arrays
    if (typeof originalValue === 'object' && typeof currentValue === 'object') {
      if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
        return true;
      }
    } else if (originalValue !== currentValue) {
      return true;
    }
  }
  
  return false;
}

/**
 * Compara arrays y retorna true si son diferentes
 */
function hasArrayChanged<T>(original: T[] | undefined, current: T[] | undefined): boolean {
  if (!original && !current) return false;
  if (!original || !current) return true;
  
  return JSON.stringify(original) !== JSON.stringify(current);
}

/**
 * Detecta qué secciones han sido modificadas comparando datos originales vs actuales
 */
export function detectDirtyState(
  originalData: Partial<CreatePrisonerData>,
  currentData: Partial<CreatePrisonerData>,
  hasFiles: boolean
): DirtyState {
  return {
    prisoner: (
      originalData.registration_number !== currentData.registration_number ||
      originalData.admission_date !== currentData.admission_date ||
      originalData.fiscal_file_number !== currentData.fiscal_file_number ||
      originalData.status !== currentData.status
    ),
    identity: hasObjectChanged(originalData.identity, currentData.identity),
    personal: hasObjectChanged(originalData.personal, currentData.personal),
    medical: hasArrayChanged(originalData.medical_record, currentData.medical_record),
    penitentiary: hasObjectChanged(originalData.penitentiary, currentData.penitentiary),
    contacts: hasArrayChanged(originalData.contacts, currentData.contacts),
    cases: hasArrayChanged(originalData.cases, currentData.cases),
    files: hasFiles,
  };
}

/**
 * Extrae solo los campos que han cambiado de un objeto
 */
export function getChangedFields<T extends Record<string, unknown>>(
  original: T | undefined,
  current: T | undefined
): Partial<T> {
  if (!original || !current) return current || {};

  const changes: Partial<T> = {};
  const allKeys = new Set([...Object.keys(original), ...Object.keys(current)]);

  for (const key of allKeys) {
    const originalValue = original[key];
    const currentValue = current[key];

    if (typeof originalValue === 'object' && typeof currentValue === 'object') {
      if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
        changes[key as keyof T] = currentValue as T[keyof T];
      }
    } else if (originalValue !== currentValue) {
      changes[key as keyof T] = currentValue as T[keyof T];
    }
  }

  return changes;
}
