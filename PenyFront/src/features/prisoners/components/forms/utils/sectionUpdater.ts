/**
 * Servicio de actualización por secciones para modo edición
 * Gestiona las actualizaciones parciales de cada sección del prisionero
 */

import { notifications } from '@mantine/notifications';
import { identityService } from '../../../../../shared/services/identityService';
import { personalService } from '../../../../../shared/services/personalService';
import { penitentiaryService } from '../../../../../shared/services/penitentiaryService';
import { medicalRecordsService } from '../../../../../shared/services/medicalRecordsService';
import { casesService } from '../../../../../shared/services/casesService';
import { mandatesService } from '../../../../../shared/services/mandatesService';
import { prisonersService } from '../../../../../shared/services/prisonersService';
import type { 
  CreatePrisonerData, 
  UpdateIdentityData,
  UpdatePersonalData,
  UpdatePenitentiaryData,
  UpdateMedicalRecordData,
  UpdateCaseData,
  UpdateMandateData
} from '../../../../../shared/types';
import type { FormFiles, SectionUpdateResult } from '../types/formState';
import { getChangedFields } from './changeDetection';

/**
 * Actualiza los datos básicos del prisionero
 */
export async function updatePrisonerBasicData(
  prisonerId: string,
  originalData: Partial<CreatePrisonerData>,
  currentData: Partial<CreatePrisonerData>
): Promise<SectionUpdateResult> {
  try {
    const changes = getChangedFields(
      {
        registration_number: originalData.registration_number,
        admission_date: originalData.admission_date,
        fiscal_file_number: originalData.fiscal_file_number,
        status: originalData.status,
      },
      {
        registration_number: currentData.registration_number,
        admission_date: currentData.admission_date,
        fiscal_file_number: currentData.fiscal_file_number,
        status: currentData.status,
      }
    );

    if (Object.keys(changes).length > 0) {
      await prisonersService.updatePrisoner(prisonerId, changes as any);
      return { success: true, sectionName: 'Datos básicos' };
    }

    return { success: true, sectionName: 'Datos básicos' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, sectionName: 'Datos básicos', error: message };
  }
}

/**
 * Actualiza la información de identidad
 */
export async function updateIdentityData(
  prisonerId: string,
  originalData: Partial<CreatePrisonerData>,
  currentData: Partial<CreatePrisonerData>
): Promise<SectionUpdateResult> {
  try {
    if (!currentData.identity) {
      return { success: true, sectionName: 'Identidad' };
    }

    const changes = getChangedFields(
      originalData.identity,
      currentData.identity
    ) as UpdateIdentityData;

    if (Object.keys(changes).length > 0) {
      await identityService.updateIdentity(prisonerId, changes);
      return { success: true, sectionName: 'Identidad' };
    }

    return { success: true, sectionName: 'Identidad' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, sectionName: 'Identidad', error: message };
  }
}

/**
 * Actualiza los archivos (foto y huellas)
 */
export async function updateIdentityFiles(
  prisonerId: string,
  files: FormFiles
): Promise<SectionUpdateResult> {
  try {
    const uploadPromises: Promise<unknown>[] = [];

    if (files.photo) {
      uploadPromises.push(identityService.uploadPhoto(prisonerId, files.photo));
    }

    if (files.fingerprintRight) {
      uploadPromises.push(
        identityService.uploadFingerprint(prisonerId, files.fingerprintRight, 'right')
      );
    }

    if (files.fingerprintLeft) {
      uploadPromises.push(
        identityService.uploadFingerprint(prisonerId, files.fingerprintLeft, 'left')
      );
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
      return { success: true, sectionName: 'Archivos de identidad' };
    }

    return { success: true, sectionName: 'Archivos de identidad' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, sectionName: 'Archivos de identidad', error: message };
  }
}

/**
 * Actualiza el archivo médico
 */
export async function updateMedicalFiles(
  prisonerId: string,
  medicalRecordId: string,
  files: FormFiles
): Promise<SectionUpdateResult> {
  try {
    if (files.medicalFile) {
      await medicalRecordsService.uploadMedicalFile(prisonerId, medicalRecordId, files.medicalFile);
      return { success: true, sectionName: 'Archivo médico' };
    }

    return { success: true, sectionName: 'Archivo médico' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, sectionName: 'Archivo médico', error: message };
  }
}

/**
 * Actualiza la información personal
 */
export async function updatePersonalData(
  prisonerId: string,
  originalData: Partial<CreatePrisonerData>,
  currentData: Partial<CreatePrisonerData>
): Promise<SectionUpdateResult> {
  try {
    if (!currentData.personal) {
      return { success: true, sectionName: 'Información personal' };
    }

    const changes = getChangedFields(
      originalData.personal,
      currentData.personal
    ) as UpdatePersonalData;

    if (Object.keys(changes).length > 0) {
      await personalService.updatePersonal(prisonerId, changes);
      return { success: true, sectionName: 'Información personal' };
    }

    return { success: true, sectionName: 'Información personal' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, sectionName: 'Información personal', error: message };
  }
}

/**
 * Actualiza los registros médicos
 * Nota: Solo actualiza el primer registro médico existente
 */
export async function updateMedicalData(
  prisonerId: string,
  originalData: Partial<CreatePrisonerData>,
  currentData: Partial<CreatePrisonerData>
): Promise<SectionUpdateResult> {
  try {
    if (!currentData.medical_record || currentData.medical_record.length === 0) {
      return { success: true, sectionName: 'Registros médicos' };
    }

    const currentRecord = currentData.medical_record[0];
    const originalRecord = originalData.medical_record?.[0];

    // Si no existe registro original, no actualizamos (se requiere crear primero)
    if (!originalRecord || !(currentRecord as any).id) {
      return { success: true, sectionName: 'Registros médicos' };
    }

    const changes = getChangedFields(originalRecord, currentRecord) as UpdateMedicalRecordData;

    if (Object.keys(changes).length > 0) {
      const recordId = (currentRecord as any).id;
      await medicalRecordsService.updateMedicalRecord(prisonerId, recordId, changes);
      return { success: true, sectionName: 'Registros médicos' };
    }

    return { success: true, sectionName: 'Registros médicos' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, sectionName: 'Registros médicos', error: message };
  }
}

/**
 * Actualiza la información penitenciaria
 */
export async function updatePenitentiaryData(
  prisonerId: string,
  originalData: Partial<CreatePrisonerData>,
  currentData: Partial<CreatePrisonerData>
): Promise<SectionUpdateResult> {
  try {
    if (!currentData.penitentiary) {
      return { success: true, sectionName: 'Ubicación penitenciaria' };
    }

    const changes = getChangedFields(
      originalData.penitentiary,
      currentData.penitentiary
    ) as UpdatePenitentiaryData;

    if (Object.keys(changes).length > 0) {
      await penitentiaryService.updatePenitentiary(prisonerId, changes);
      return { success: true, sectionName: 'Ubicación penitenciaria' };
    }

    return { success: true, sectionName: 'Ubicación penitenciaria' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, sectionName: 'Ubicación penitenciaria', error: message };
  }
}

/**
 * Actualiza los contactos
 * Nota: Actualmente no hay endpoint de actualización individual de contactos
 * Esta es una limitación del backend actual
 */
export async function updateContactsData(
  _prisonerId: string,
  originalData: Partial<CreatePrisonerData>,
  currentData: Partial<CreatePrisonerData>
): Promise<SectionUpdateResult> {
  try {
    // TODO: Implementar cuando el backend tenga endpoints de actualización de contactos
    // Por ahora, solo registramos que hubo cambios pero no los persistimos
    
    const hasChanges = JSON.stringify(originalData.contacts) !== JSON.stringify(currentData.contacts);
    
    if (hasChanges) {
      notifications.show({
        title: 'Advertencia',
        message: 'Los cambios en contactos no se pueden guardar actualmente. Se requiere recrear los contactos.',
        color: 'yellow',
        autoClose: 5000,
      });
    }

    return { success: true, sectionName: 'Contactos' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, sectionName: 'Contactos', error: message };
  }
}

/**
 * Actualiza los casos legales y sus mandatos
 */
export async function updateCasesData(
  _prisonerId: string,
  originalData: Partial<CreatePrisonerData>,
  currentData: Partial<CreatePrisonerData>
): Promise<SectionUpdateResult> {
  try {
    if (!currentData.cases || currentData.cases.length === 0) {
      return { success: true, sectionName: 'Casos legales' };
    }

    const originalCases = originalData.cases || [];
    const currentCases = currentData.cases;

    // Actualizar casos existentes
    for (const currentCase of currentCases) {
      const caseId = (currentCase as any).id;
      
      if (caseId) {
        // Caso existente - actualizar
        const originalCase = originalCases.find((c: any) => c.id === caseId);
        
        if (originalCase) {
          const caseChanges = getChangedFields(originalCase as any, currentCase as any) as UpdateCaseData;
          
          if (Object.keys(caseChanges).length > 0) {
            await casesService.updateCase(caseId, caseChanges);
          }

          // Actualizar mandatos del caso
          if (currentCase.mandates && currentCase.mandates.length > 0) {
            const originalMandates = (originalCase as any).mandates || [];
            
            for (const currentMandate of currentCase.mandates) {
              const mandateId = (currentMandate as any).id;
              
              if (mandateId) {
                // Mandato existente - actualizar
                const originalMandate = originalMandates.find((m: any) => m.id === mandateId);
                
                if (originalMandate) {
                  const mandateChanges = getChangedFields(
                    originalMandate,
                    currentMandate as any
                  ) as UpdateMandateData;
                  
                  if (Object.keys(mandateChanges).length > 0) {
                    await mandatesService.updateMandate(mandateId, mandateChanges);
                  }
                }
              }
            }
          }
        }
      }
    }

    return { success: true, sectionName: 'Casos legales' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, sectionName: 'Casos legales', error: message };
  }
}

/**
 * Orquesta la actualización de todas las secciones modificadas
 */
export async function updateModifiedSections(
  prisonerId: string,
  originalData: Partial<CreatePrisonerData>,
  currentData: Partial<CreatePrisonerData>,
  files: FormFiles,
  dirtyState: {
    prisoner: boolean;
    identity: boolean;
    personal: boolean;
    medical: boolean;
    penitentiary: boolean;
    contacts: boolean;
    cases: boolean;
    files: boolean;
  }
): Promise<{ success: boolean; results: SectionUpdateResult[] }> {
  const results: SectionUpdateResult[] = [];
  let totalSections = 0;
  let completedSections = 0;

  // Contar secciones a actualizar
  totalSections = Object.values(dirtyState).filter(Boolean).length;

  try {
    // Actualizar datos básicos del prisionero
    if (dirtyState.prisoner) {
      completedSections++;
      notifications.show({
        title: `Progreso ${completedSections}/${totalSections}`,
        message: 'Actualizando datos básicos...',
        color: 'blue',
        autoClose: 2000,
      });
      
      const result = await updatePrisonerBasicData(prisonerId, originalData, currentData);
      results.push(result);
    }

    // Actualizar identidad
    if (dirtyState.identity) {
      completedSections++;
      notifications.show({
        title: `Progreso ${completedSections}/${totalSections}`,
        message: 'Actualizando identidad...',
        color: 'blue',
        autoClose: 2000,
      });
      
      const result = await updateIdentityData(prisonerId, originalData, currentData);
      results.push(result);
    }

    // Actualizar archivos
    if (dirtyState.files) {
      completedSections++;
      notifications.show({
        title: `Progreso ${completedSections}/${totalSections}`,
        message: 'Subiendo archivos...',
        color: 'blue',
        autoClose: 2000,
      });
      
      const result = await updateIdentityFiles(prisonerId, files);
      results.push(result);
    }

    // Actualizar información personal
    if (dirtyState.personal) {
      completedSections++;
      notifications.show({
        title: `Progreso ${completedSections}/${totalSections}`,
        message: 'Actualizando información personal...',
        color: 'blue',
        autoClose: 2000,
      });
      
      const result = await updatePersonalData(prisonerId, originalData, currentData);
      results.push(result);
    }

    // Actualizar registros médicos
    if (dirtyState.medical) {
      completedSections++;
      notifications.show({
        title: `Progreso ${completedSections}/${totalSections}`,
        message: 'Actualizando registros médicos...',
        color: 'blue',
        autoClose: 2000,
      });
      
      const result = await updateMedicalData(prisonerId, originalData, currentData);
      results.push(result);
      
      // Subir archivo médico si existe
      if (files.medicalFile && currentData.medical_record?.[0]) {
        const medicalRecordId = (currentData.medical_record[0] as any).id;
        if (medicalRecordId) {
          const fileResult = await updateMedicalFiles(prisonerId, medicalRecordId, files);
          results.push(fileResult);
        }
      }
    }

    // Actualizar ubicación penitenciaria
    if (dirtyState.penitentiary) {
      completedSections++;
      notifications.show({
        title: `Progreso ${completedSections}/${totalSections}`,
        message: 'Actualizando ubicación penitenciaria...',
        color: 'blue',
        autoClose: 2000,
      });
      
      const result = await updatePenitentiaryData(prisonerId, originalData, currentData);
      results.push(result);
    }

    // Actualizar contactos
    if (dirtyState.contacts) {
      completedSections++;
      notifications.show({
        title: `Progreso ${completedSections}/${totalSections}`,
        message: 'Verificando contactos...',
        color: 'blue',
        autoClose: 2000,
      });
      
      const result = await updateContactsData(prisonerId, originalData, currentData);
      results.push(result);
    }

    // Actualizar casos
    if (dirtyState.cases) {
      completedSections++;
      notifications.show({
        title: `Progreso ${completedSections}/${totalSections}`,
        message: 'Actualizando casos legales...',
        color: 'blue',
        autoClose: 2000,
      });
      
      const result = await updateCasesData(prisonerId, originalData, currentData);
      results.push(result);
    }

    // Verificar si todas las actualizaciones fueron exitosas
    const allSuccess = results.every(r => r.success);

    return { success: allSuccess, results };
  } catch (error) {
    console.error('[updateModifiedSections] Error inesperado:', error);
    return {
      success: false,
      results: [
        {
          success: false,
          sectionName: 'Sistema',
          error: error instanceof Error ? error.message : 'Error inesperado',
        },
      ],
    };
  }
}
