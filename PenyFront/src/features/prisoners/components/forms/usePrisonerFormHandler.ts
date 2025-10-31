import { useState, useCallback, useEffect, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { usePrisonerFormSteps } from './usePrisonerFormSteps';
import { prisonersService } from '../../../../shared/services/prisonersService';
import { identityService } from '../../../../shared/services/identityService';
import { personalService } from '../../../../shared/services/personalService';
import { childrenService } from '../../../../shared/services/childrenService';
import { belongingsService } from '../../../../shared/services/belongingsService';
import { medicalRecordsService } from '../../../../shared/services/medicalRecordsService';
import { penitentiaryService } from '../../../../shared/services/penitentiaryService';
import { contactsService } from '../../../../shared/services/contactsService';
import { casesService } from '../../../../shared/services/casesService';
import { mandatesService } from '../../../../shared/services/mandatesService';
import type { CreatePrisonerData, PrisonerBase } from '../../../../shared/types';
import type { FormFiles } from './types/formState';
import { detectDirtyState } from './utils/changeDetection';
import { updateModifiedSections } from './utils/sectionUpdater';

interface PrisonerFormWizardProps {
  mode?: 'create' | 'edit';
  prisonerId?: string;
  initialData?: Partial<CreatePrisonerData>;
  onSuccess?: (result: { prisoner: PrisonerBase; id: string }) => void;
  onCancel?: () => void;
}

/**
 * Hook profesional para manejar el wizard de prisioneros
 * Soporta modo creación y edición con actualizaciones parciales por sección
 */
export function usePrisonerFormHandlers({
  mode = 'create',
  prisonerId: initialPrisonerId,
  initialData,
  onSuccess,
  onCancel
}: PrisonerFormWizardProps) {
  const steps = usePrisonerFormSteps();
  
  // Estado del formulario
  const [formData, setFormData] = useState<Partial<CreatePrisonerData>>(
    adaptInitialData(initialData)
  );
  const [formFiles, setFormFiles] = useState<FormFiles>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Referencia a los datos originales (para detectar cambios en modo edición)
  const originalDataRef = useRef<Partial<CreatePrisonerData>>(adaptInitialData(initialData));
  
  // Actualizar datos originales cuando cambie initialData en modo edición
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      originalDataRef.current = adaptInitialData(initialData);
      setFormData(adaptInitialData(initialData));
    }
  }, [mode, initialData]);

  /**
   * Adapta los datos iniciales al formato correcto
   */
  function adaptInitialData(data: Partial<CreatePrisonerData> | undefined): Partial<CreatePrisonerData> {
    if (!data) return {};
    return {
      ...data,
      admission_date: data.admission_date
        ? typeof data.admission_date === 'string'
          ? data.admission_date
          : (data.admission_date as Date).toISOString()
        : undefined,
    };
  }

  /**
   * Actualiza los datos del formulario (inmutable)
   */
  const handleDataUpdate = useCallback((updates: Partial<CreatePrisonerData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Limpiar errores relacionados cuando se actualiza
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach(key => {
        delete newErrors[key];
      });
      return newErrors;
    });
  }, []);

  /**
   * Actualiza los archivos del formulario
   */
  const handleFileUpdate = useCallback((fileType: keyof FormFiles, file: File | undefined) => {
    setFormFiles(prev => {
      const updates: Partial<FormFiles> = { [fileType]: file };
      
      // Sincronizar ambos formatos de nombres (photo/photoFile, etc.)
      if (fileType === 'photo') {
        updates.photoFile = file;
      } else if (fileType === 'photoFile') {
        updates.photo = file;
      } else if (fileType === 'fingerprintLeft') {
        updates.fingerprintLeftFile = file;
      } else if (fileType === 'fingerprintLeftFile') {
        updates.fingerprintLeft = file;
      } else if (fileType === 'fingerprintRight') {
        updates.fingerprintRightFile = file;
      } else if (fileType === 'fingerprintRightFile') {
        updates.fingerprintRight = file;
      }
      
      return { ...prev, ...updates };
    });
  }, []);

  /**
   * Valida el paso actual
   */
  const validateStep = useCallback((step: number): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Información básica e identidad
        if (!formData.registration_number?.trim()) {
          newErrors.registration_number = 'El número de registro es requerido';
        }
        if (!formData.admission_date) {
          newErrors.admission_date = 'La fecha de ingreso es requerida';
        }
        if (!formData.fiscal_file_number?.trim()) {
          newErrors.fiscal_file_number = 'El número de expediente fiscal es requerido';
        }
        if (!formData.identity?.surname?.trim()) {
          newErrors['identity.surname'] = 'Los apellidos son requeridos';
        }
        if (!formData.identity?.first_name?.trim()) {
          newErrors['identity.first_name'] = 'Los nombres son requeridos';
        }
        if (!formData.identity?.birth_date) {
          newErrors['identity.birth_date'] = 'La fecha de nacimiento es requerida';
        }
        if (!formData.identity?.birth_place?.trim()) {
          newErrors['identity.birth_place'] = 'El lugar de nacimiento es requerido';
        }
        if (!formData.identity?.residence?.trim()) {
          newErrors['identity.residence'] = 'El domicilio es requerido';
        }
        if (!formData.identity?.nationality?.trim()) {
          newErrors['identity.nationality'] = 'La nacionalidad es requerida';
        }
        break;

      case 1: // Información personal (opcional en su mayoría)
        break;

      case 2: // Examen médico (opcional)
        break;

      case 3: // Ubicación penitenciaria (opcional)
        break;

      case 4: // Contactos (opcional)
        break;

      case 5: // Tema legal - Casos y mandatos
        if (formData.cases && formData.cases.length > 0) {
          formData.cases.forEach((caseData, caseIndex) => {
            if (!caseData.case_number?.trim()) {
              newErrors[`cases.${caseIndex}.case_number`] = 'El número de caso es requerido';
            }
            if (!caseData.crime?.trim()) {
              newErrors[`cases.${caseIndex}.crime`] = 'El delito es requerido';
            }
            if (!caseData.status) {
              newErrors[`cases.${caseIndex}.status`] = 'El estado del caso es requerido';
            }
            if (!caseData.start_date) {
              newErrors[`cases.${caseIndex}.start_date`] = 'La fecha de inicio es requerida';
            }
            if (!caseData.court_name?.trim()) {
              newErrors[`cases.${caseIndex}.court_name`] = 'El nombre del juzgado es requerido';
            }
            if (!caseData.judge_name?.trim()) {
              newErrors[`cases.${caseIndex}.judge_name`] = 'El nombre del juez es requerido';
            }
            if (caseData.sentence_years === undefined || caseData.sentence_years < 0) {
              newErrors[`cases.${caseIndex}.sentence_years`] = 'Los años de sentencia son requeridos';
            }

            // Validar mandatos del caso
            caseData.mandates?.forEach((mandate, mandateIndex) => {
              if (!mandate.type) {
                newErrors[`cases.${caseIndex}.mandates.${mandateIndex}.type`] = 'El tipo de mandato es requerido';
              }
              if (!mandate.issue_date) {
                newErrors[`cases.${caseIndex}.mandates.${mandateIndex}.issue_date`] = 'La fecha de emisión es requerida';
              }
              if (!mandate.status) {
                newErrors[`cases.${caseIndex}.mandates.${mandateIndex}.status`] = 'El estado es requerido';
              }
            });
          });
        }
        break;
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, [formData]);

  /**
   * Avanza al siguiente paso (solo valida, no persiste)
   */
  const handleNext = useCallback(async () => {
    const validation = validateStep(activeStep);

    if (!validation.isValid) {
      setErrors(validation.errors);
      notifications.show({
        title: 'Campos requeridos',
        message: 'Por favor completa todos los campos requeridos',
        color: 'red'
      });
      return;
    }

    // Avanzar al siguiente paso
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    setErrors({});
  }, [activeStep, validateStep, steps.length]);

  /**
   * Retrocede al paso anterior
   */
  const handlePrevious = useCallback(() => {
    setActiveStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  }, []);

  /**
   * Cancela el formulario
   */
  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  /**
   * Maneja el modo de creación (crea todo desde cero)
   */
  const handleCreateMode = useCallback(async () => {
    let prisonerId: string | undefined;

    // PASO 1: Crear prisionero básico
    const prisonerData: CreatePrisonerData = {
      registration_number: formData.registration_number!,
      admission_date: formData.admission_date!,
      fiscal_file_number: formData.fiscal_file_number,
      status: formData.status || 'Activo'
    };

    const prisoner = await prisonersService.createPrisoner(prisonerData);
    prisonerId = prisoner.id;
    
    notifications.show({
      title: 'Progreso 1/8',
      message: 'Prisionero creado',
      color: 'blue'
    });

    // PASO 2: Crear identidad
    if (formData.identity) {
      const identityData = {
        surname: formData.identity.surname || '',
        first_name: formData.identity.first_name || '',
        birth_date: typeof formData.identity.birth_date === 'string' 
          ? formData.identity.birth_date 
          : formData.identity.birth_date?.toISOString().split('T')[0] || '',
        birth_place: formData.identity.birth_place || '',
        residence: formData.identity.residence || '',
        nationality: formData.identity.nationality || '',
        citizenship_type: formData.identity.citizenship_type,
        country_of_origin: formData.identity.country_of_origin,
        nationality_type: formData.identity.nationality_type
      };

      await identityService.createIdentity(prisonerId, identityData);
      
      notifications.show({
        title: 'Progreso 2/8',
        message: 'Identidad guardada',
        color: 'blue'
      });
    }

    // PASO 3: Subir archivos (foto y huellas)
    if (formFiles.photoFile) {
      await identityService.uploadPhoto(prisonerId, formFiles.photoFile);
    }
    if (formFiles.fingerprintRightFile) {
      await identityService.uploadFingerprint(prisonerId, formFiles.fingerprintRightFile, 'right');
    }
    if (formFiles.fingerprintLeftFile) {
      await identityService.uploadFingerprint(prisonerId, formFiles.fingerprintLeftFile, 'left');
    }
    
    notifications.show({
      title: 'Progreso 3/8',
      message: 'Archivos subidos',
      color: 'blue'
    });

    // PASO 4: Guardar información personal
    if (formData.personal) {
      const personalData = {
        gender: formData.personal.gender as "Masculino" | "Femenino" | "Otro",
        father_name: formData.personal.father_name || '',
        mother_name: formData.personal.mother_name || '',
        education_level: formData.personal.education_level || '',
        occupation: formData.personal.occupation || '',
        languages: formData.personal.languages || '',
        marital_status: formData.personal.marital_status as "Soltero" | "Casado" | "Viudo" | "Divorciado",
        id_document_type: formData.personal.id_document_type as "CedulaDeIdentidad" | "Pasaporte" | "Otro",
        id_document_number: formData.personal.id_document_number || ''
      };

      await personalService.createPersonal(prisonerId, personalData);
      
      notifications.show({
        title: 'Progreso 4/8',
        message: 'Información personal guardada',
        color: 'blue'
      });
    }

    // PASO 5: Guardar hijos y pertenencias
    if (formData.child && formData.child.length > 0) {
      for (const child of formData.child) {
        const childData = {
          full_name: (child as any).full_name || (child as any).name || '',
          birth_date: child.birth_date || ''
        };
        await childrenService.createChild(prisonerId, childData);
      }
    }

    if (formData.belongings && formData.belongings.length > 0) {
      for (const belonging of formData.belongings) {
        const belongingData = {
          description: belonging.description || '',
          quantity: belonging.quantity || 1,
          condition: belonging.condition || ''
        };
        await belongingsService.createBelonging(prisonerId, belongingData);
      }
    }
    
    notifications.show({
      title: 'Progreso 5/8',
      message: 'Hijos y pertenencias guardadas',
      color: 'blue'
    });

    // PASO 6: Guardar examen médico
    if (formData.medical_record && Array.isArray(formData.medical_record) && formData.medical_record.length > 0) {
      const record = formData.medical_record[0];
      const medicalData = {
        doctor_name: (record as any).doctor_name || 'No especificado',
        examination_date: (record as any).examination_date || new Date().toISOString().split('T')[0],
        reference_number: (record as any).reference_number,
        notes: (record as any).notes
      };

      await medicalRecordsService.createMedicalRecord(prisonerId, medicalData);
      
      notifications.show({
        title: 'Progreso 6/8',
        message: 'Examen médico guardado',
        color: 'blue'
      });
    }

    // PASO 7: Guardar información penitenciaria
    if (formData.penitentiary) {
      const penitentiaryData = {
        building_number: formData.penitentiary.building_number,
        cell_number: formData.penitentiary.cell_number,
        bed_number: formData.penitentiary.bed_number,
        category: formData.penitentiary.category as "DerechoComun" | "PrisionPreventiva" | "PrisioneroAcusado" | undefined
      };

      await penitentiaryService.createPenitentiary(prisonerId, penitentiaryData);
      
      notifications.show({
        title: 'Progreso 7/8',
        message: 'Ubicación penitenciaria guardada',
        color: 'blue'
      });
    }

    // PASO 8: Guardar contactos
    if (formData.contacts && formData.contacts.length > 0) {
      for (const contact of formData.contacts) {
        const contactData = {
          name: contact.name || '',
          phone: contact.phone || '',
          relationship: contact.relationship || '',
          address: contact.address
        };
        await contactsService.createContact(prisonerId, contactData);
      }
      
      notifications.show({
        title: 'Progreso 8/8',
        message: 'Contactos guardados',
        color: 'blue'
      });
    }

    // PASO 9: Guardar casos y mandatos
    if (formData.cases && formData.cases.length > 0) {
      for (const caseData of formData.cases) {
        const casePayload = {
          case_number: caseData.case_number || '',
          crime: caseData.crime || '',
          status: caseData.status || 'EnProceso',
          start_date: caseData.start_date || '',
          end_date: caseData.end_date,
          court_name: caseData.court_name || '',
          judge_name: caseData.judge_name || '',
          sentence_years: caseData.sentence_years || 0,
          remarks: caseData.remarks
        };

        const createdCase = await casesService.createCase(prisonerId, casePayload);

        // Guardar mandatos del caso
        if (caseData.mandates && caseData.mandates.length > 0 && createdCase.id) {
          for (const mandate of caseData.mandates) {
            const mandatePayload = {
              type: mandate.type || 'Detencion',
              issue_date: mandate.issue_date || '',
              status: mandate.status || 'Vigente',
              description: mandate.description
            };

            await mandatesService.createMandate(createdCase.id, mandatePayload);
          }
        }
      }
      
      notifications.show({
        title: 'Completado',
        message: 'Casos y mandatos guardados',
        color: 'blue'
      });
    }

    // Notificación final de éxito
    notifications.show({
      title: 'Registro completado',
      message: 'El prisionero se registró exitosamente',
      color: 'green'
    });

    // Obtener el prisionero completo para el callback
    const finalPrisoner = await prisonersService.getPrisoner(prisonerId);
    
    onSuccess?.({
      prisoner: finalPrisoner,
      id: prisonerId
    });
  }, [formData, formFiles, onSuccess]);

  /**
   * Maneja el modo de edición (actualiza solo lo que cambió)
   */
  const handleEditMode = useCallback(async (prisonerId: string) => {
    const hasFiles = !!(formFiles.photoFile || formFiles.fingerprintLeftFile || formFiles.fingerprintRightFile);
    
    // Detectar qué secciones han sido modificadas
    const dirtyState = detectDirtyState(
      originalDataRef.current,
      formData,
      hasFiles
    );

    // Verificar si hay cambios
    const hasChanges = Object.values(dirtyState).some(v => v);
    
    if (!hasChanges) {
      notifications.show({
        title: 'Sin cambios',
        message: 'No se detectaron cambios para guardar',
        color: 'blue'
      });
      
      // Obtener el prisionero completo para el callback
      const prisoner = await prisonersService.getPrisoner(prisonerId);
      onSuccess?.({ prisoner, id: prisonerId });
      return;
    }

    // Actualizar solo las secciones modificadas
    const { success, results } = await updateModifiedSections(
      prisonerId,
      originalDataRef.current,
      formData,
      formFiles,
      dirtyState
    );

    // Mostrar resultados
    const failedSections = results.filter(r => !r.success);
    
    if (success) {
      notifications.show({
        title: 'Actualización completada',
        message: `Se actualizaron ${results.length} sección(es) correctamente`,
        color: 'green'
      });

      // Obtener el prisionero completo para el callback
      const prisoner = await prisonersService.getPrisoner(prisonerId);
      onSuccess?.({ prisoner, id: prisonerId });
    } else {
      notifications.show({
        title: 'Actualización parcial',
        message: `${failedSections.length} sección(es) fallaron: ${failedSections.map(f => f.sectionName).join(', ')}`,
        color: 'orange',
        autoClose: 7000
      });
    }
  }, [formData, formFiles, onSuccess]);

  /**
   * Maneja el envío final del formulario
   */
  const handleSubmit = useCallback(async () => {
    // Validar el paso actual
    const validation = validateStep(activeStep);
    if (!validation.isValid) {
      setErrors(validation.errors);
      notifications.show({
        title: 'Campos requeridos',
        message: 'Por favor completa todos los campos requeridos',
        color: 'red'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await handleCreateMode();
      } else if (mode === 'edit' && initialPrisonerId) {
        await handleEditMode(initialPrisonerId);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Ocurrió un error al guardar la información';
      console.error('[usePrisonerFormHandler] Error en handleSubmit:', error);
      
      notifications.show({
        title: 'Error al guardar',
        message: errMsg,
        color: 'red',
        autoClose: 7000
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [activeStep, validateStep, mode, initialPrisonerId, handleCreateMode, handleEditMode]);

  return {
    formData,
    errors,
    activeStep,
    isSubmitting,
    canGoNext: true,
    handleDataUpdate,
    handleFileUpdate,
    handlePrevious,
    handleNext,
    handleCancel,
    handleSubmit,
    steps
  };
}

