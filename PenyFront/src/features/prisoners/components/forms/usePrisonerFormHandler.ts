import { useState, useCallback } from 'react';
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

interface PrisonerFormHandlerProps {
  initialData?: Partial<CreatePrisonerData>;
  onSuccess?: (result: { prisoner: PrisonerBase; id: string }) => void;
  onCancel?: () => void;
}

/**
 * Hook para manejar el wizard de creación de prisioneros
 * Modo único: CREATE
 */
export function usePrisonerFormHandlers({
  initialData,
  onSuccess,
  onCancel
}: PrisonerFormHandlerProps) {
  const steps = usePrisonerFormSteps();
  
  // Estado del formulario
  const [formData, setFormData] = useState<Partial<CreatePrisonerData>>(
    adaptInitialData(initialData)
  );
  const [formFiles, setFormFiles] = useState<FormFiles>({
    belongingFiles: {},
    mandateFiles: {}
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Limpiar errores relacionados
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
   * Soporta archivos simples y archivos múltiples (belongings, mandates)
   */
  const handleFileUpdate = useCallback((
    fileType: keyof FormFiles | string, 
    file: File | undefined,
    index?: string | number
  ) => {
    if (fileType === 'belongingFiles' && index !== undefined) {
      // Archivo de pertenencia
      setFormFiles(prev => ({
        ...prev,
        belongingFiles: {
          ...prev.belongingFiles,
          [index]: file!
        }
      }));
    } else if (fileType === 'mandateFiles' && index !== undefined) {
      // Archivo de mandato
      setFormFiles(prev => ({
        ...prev,
        mandateFiles: {
          ...prev.mandateFiles,
          [index]: file!
        }
      }));
    } else {
      // Archivo simple (photo, fingerprints, medical)
      setFormFiles(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
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

      case 1: // Información personal (opcional)
        break;

      case 2: // Examen médico (opcional)
        break;

      case 3: // Ubicación penitenciaria (opcional)
        break;

      case 4: // Contactos (opcional)
        break;

      case 5: // Casos legales (opcional)
        break;

      default:
        break;
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, [formData]);

  /**
   * Determina si se puede avanzar al siguiente paso
   */
  const canGoNext = useCallback((): boolean => {
    return validateStep(activeStep).isValid;
  }, [activeStep, validateStep]);

  /**
   * Avanza al siguiente paso
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
   * Crea el prisionero completo (flujo de creación)
   */
  const handleSubmit = useCallback(async () => {
    // Validar último paso
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
      // PASO 1: Crear prisionero básico
      const prisonerData: CreatePrisonerData = {
        registration_number: formData.registration_number!,
        admission_date: formData.admission_date!,
        fiscal_file_number: formData.fiscal_file_number,
        status: formData.status || 'Activo'
      };

      const prisoner = await prisonersService.createPrisoner(prisonerData);
      const prisonerId = prisoner.id;
      
      notifications.show({
        title: 'Progreso 1/9',
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
          title: 'Progreso 2/9',
          message: 'Identidad guardada',
          color: 'blue'
        });
      }

      // PASO 3: Subir archivos de identidad
      if (formFiles.photo) {
        await identityService.uploadPhoto(prisonerId, formFiles.photo);
      }
      if (formFiles.fingerprintRight) {
        await identityService.uploadFingerprint(prisonerId, formFiles.fingerprintRight, 'right');
      }
      if (formFiles.fingerprintLeft) {
        await identityService.uploadFingerprint(prisonerId, formFiles.fingerprintLeft, 'left');
      }
      
      notifications.show({
        title: 'Progreso 3/9',
        message: 'Archivos de identidad subidos',
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
          title: 'Progreso 4/9',
          message: 'Información personal guardada',
          color: 'blue'
        });
      }

      // PASO 5: Guardar pertenencias y sus archivos
      if (formData.belongings && formData.belongings.length > 0) {
        for (let i = 0; i < formData.belongings.length; i++) {
          const belonging = formData.belongings[i];
          const belongingData = {
            description: belonging.description || '',
            quantity: belonging.quantity || 1,
            condition: belonging.condition,
            returned: belonging.is_returned || false
          };

          const createdBelonging = await belongingsService.createBelonging(prisonerId, belongingData);
          
          // Subir archivo de inventario si existe
          const belongingFile = formFiles.belongingFiles?.[belonging.tempId || i];
          if (belongingFile && createdBelonging.id) {
            await belongingsService.uploadInventory(prisonerId, createdBelonging.id, belongingFile);
          }
        }
        
        notifications.show({
          title: 'Progreso 5/9',
          message: 'Pertenencias guardadas',
          color: 'blue'
        });
      }

      // PASO 6: Guardar hijos
      if (formData.child && formData.child.length > 0) {
        for (const child of formData.child) {
          const childData = {
            full_name: child.full_name || '',
            birth_date: child.birth_date || ''
          };
          await childrenService.createChild(prisonerId, childData);
        }
        
        notifications.show({
          title: 'Progreso 6/9',
          message: 'Información de hijos guardada',
          color: 'blue'
        });
      }

      // PASO 7: Guardar registro médico y archivo
      if (formData.medical_record && formData.medical_record.length > 0) {
        const medical = formData.medical_record[0];
        const medicalData = {
          doctor_name: medical.doctor_name || '',
          examination_date: medical.examination_date || '',
          reference_number: medical.reference_number,
          notes: medical.notes
        };

        const createdMedical = await medicalRecordsService.createMedicalRecord(prisonerId, medicalData);
        
        // Subir archivo médico si existe
        if (formFiles.medicalFile && createdMedical.id) {
          await medicalRecordsService.uploadMedicalFile(prisonerId, createdMedical.id, formFiles.medicalFile);
        }
        
        notifications.show({
          title: 'Progreso 7/9',
          message: 'Registro médico guardado',
          color: 'blue'
        });
      }

      // PASO 8: Guardar ubicación penitenciaria
      if (formData.penitentiary) {
        const penitentiaryData = {
          category: formData.penitentiary.category as "DerechoComun" | "PrisionPreventiva" | "PrisioneroAcusado",
          building_number: formData.penitentiary.building_number || '',
          cell_number: formData.penitentiary.cell_number || '',
          bed_number: formData.penitentiary.bed_number
        };

        await penitentiaryService.createPenitentiary(prisonerId, penitentiaryData);
        
        notifications.show({
          title: 'Progreso 8/9',
          message: 'Ubicación penitenciaria guardada',
          color: 'blue'
        });
      }

      // PASO 9: Guardar contactos
      if (formData.contacts && formData.contacts.length > 0) {
        for (const contact of formData.contacts) {
          const contactData = {
            name: contact.name || '',
            relationship: contact.relationship || '',
            phone: contact.phone || ''
          };
          await contactsService.createContact(prisonerId, contactData);
        }
        
        notifications.show({
          title: 'Progreso 9/9',
          message: 'Contactos guardados',
          color: 'blue'
        });
      }

      // PASO 10: Guardar casos, mandatos y archivos de mandatos
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

          // Guardar mandatos del caso y sus archivos
          if (caseData.mandates && caseData.mandates.length > 0 && createdCase.id) {
            for (const mandate of caseData.mandates) {
              const mandatePayload = {
                type: mandate.type || 'Detencion',
                issue_date: mandate.issue_date || '',
                status: mandate.status || 'Vigente',
                description: mandate.description
              };

              const createdMandate = await mandatesService.createMandate(createdCase.id, mandatePayload);
              
              // Subir archivo del mandato si existe
              const mandateFile = formFiles.mandateFiles?.[mandate.tempId || ''];
              if (mandateFile && createdMandate.id) {
                await mandatesService.uploadMandateFile(createdMandate.id, mandateFile);
              }
            }
          }
        }
        
        notifications.show({
          title: 'Completado',
          message: 'Casos y mandatos guardados',
          color: 'green'
        });
      }

      // Notificación final de éxito
      notifications.show({
        title: '✅ Registro completado',
        message: 'El prisionero se registró exitosamente con toda su información',
        color: 'green'
      });

      // Obtener el prisionero completo para el callback
      const finalPrisoner = await prisonersService.getPrisoner(prisonerId);
      
      onSuccess?.({
        prisoner: finalPrisoner,
        id: prisonerId
      });
    } catch (error) {
      console.error('Error al crear prisionero:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al registrar el prisionero',
        color: 'red'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, formFiles, activeStep, validateStep, onSuccess]);

  return {
    formData,
    formFiles,
    errors,
    activeStep,
    isSubmitting,
    canGoNext: canGoNext(),
    handleDataUpdate,
    handleFileUpdate,
    handleNext,
    handlePrevious,
    handleCancel,
    handleSubmit,
    steps
  };
}
