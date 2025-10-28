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
import type { CreatePrisonerData, PrisonerBase } from '../../../../shared/types';

interface PrisonerFormWizardProps {
  mode?: 'create' | 'edit';
  prisonerId?: string; // ID del prisionero cuando es modo edición
  initialData?: Partial<CreatePrisonerData>;
  onSuccess?: (result: { prisoner: PrisonerBase; id: string }) => void;
  onCancel?: () => void;
}

interface FormState {
  // Datos del prisionero
  prisoner?: PrisonerBase;
  prisonerId?: string;
  
  // Archivos temporales para subir
  photoFile?: File;
  fingerprintLeftFile?: File;
  fingerprintRightFile?: File;
  
  // Estado de guardado por paso
  savedSteps: Set<number>;
}

export function usePrisonerFormHandlers({ 
  mode = 'create',
  prisonerId: initialPrisonerId,
  initialData, 
  onSuccess,
  onCancel 
}: PrisonerFormWizardProps) {
  const steps = usePrisonerFormSteps();
  const [formData, setFormData] = useState<Partial<CreatePrisonerData>>(adaptInitialData(initialData));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    prisonerId: initialPrisonerId,
    savedSteps: new Set()
  });

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
   * Valida los datos del paso actual
   */
  const validateStep = useCallback((step: number): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      // Validar información básica
      if (!formData.registration_number?.trim()) {
        newErrors.registration_number = 'El número de registro es requerido';
      }
      if (!formData.admission_date) {
        newErrors.admission_date = 'La fecha de ingreso es requerida';
      }
      if (!formData.fiscal_file_number?.trim()) {
        newErrors.fiscal_file_number = 'El número de expediente fiscal es requerido';
      }

      // Validar identidad
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
      if (!formData.identity?.citizenship_type) {
        newErrors['identity.citizenship_type'] = 'El tipo de ciudadanía es requerido';
      }
      if (!formData.identity?.country_of_origin?.trim()) {
        newErrors['identity.country_of_origin'] = 'El país de origen es requerido';
      }
      if (!formData.identity?.nationality?.trim()) {
        newErrors['identity.nationality'] = 'La nacionalidad es requerida';
      }
      if (!formData.identity?.nationality_type?.trim()) {
        newErrors['identity.nationality_type'] = 'El tipo de nacionalidad es requerido';
      }
    }

    // Validar paso 1: Información personal, hijos y pertenencias
    if (step === 1) {
      // Validar información personal (campos requeridos)
      if (!formData.personal?.marital_status?.trim()) {
        newErrors['personal.marital_status'] = 'El estado civil es requerido';
      }
      if (!formData.personal?.education_level?.trim()) {
        newErrors['personal.education_level'] = 'El nivel de educación es requerido';
      }
      if (!formData.personal?.gender?.trim()) {
        newErrors['personal.gender'] = 'El género es requerido';
      }
      if (!formData.personal?.occupation?.trim()) {
        newErrors['personal.occupation'] = 'La ocupación es requerida';
      }

      // Validar hijos si existen
      formData.child?.forEach((child, index) => {
        if (!child.name?.trim()) {
          newErrors[`child.${index}.name`] = 'El nombre del hijo es requerido';
        }
        if (!child.birth_date) {
          newErrors[`child.${index}.birth_date`] = 'La fecha de nacimiento es requerida';
        }
      });

      // Validar pertenencias si existen
      formData.belongings?.forEach((belonging, index) => {
        if (!belonging.description?.trim()) {
          newErrors[`belonging.${index}.description`] = 'La descripción es requerida';
        }
        if (!belonging.quantity || belonging.quantity < 1) {
          newErrors[`belonging.${index}.quantity`] = 'La cantidad debe ser mayor a 0';
        }
      });
    }

    // Validar paso 2: Registros médicos
    if (step === 2) {
      formData.medical_record?.forEach((record, index) => {
        if (!record.doctor_name?.trim()) {
          newErrors[`medical_record.${index}.doctor_name`] = 'El nombre del doctor es requerido';
        }
        if (!record.examination_date) {
          newErrors[`medical_record.${index}.examination_date`] = 'La fecha de examen es requerida';
        }
      });
    }

    // Validar paso 3: Información penitenciaria
    if (step === 3) {
      if (!formData.penitentiary?.category?.trim()) {
        newErrors['penitentiary.category'] = 'La categoría es requerida';
      }
      if (!formData.penitentiary?.building_number?.trim()) {
        newErrors['penitentiary.building_number'] = 'El número de edificio es requerido';
      }
      if (!formData.penitentiary?.cell_number?.trim()) {
        newErrors['penitentiary.cell_number'] = 'El número de celda es requerido';
      }
      if (!formData.penitentiary?.bed_number?.trim()) {
        newErrors['penitentiary.bed_number'] = 'El número de cama es requerido';
      }
    }

    // Validar paso 4: Contactos
    if (step === 4) {
      formData.contacts?.forEach((contact, index) => {
        if (!contact.name?.trim()) {
          newErrors[`contact.${index}.name`] = 'El nombre del contacto es requerido';
        }
        if (!contact.relationship?.trim()) {
          newErrors[`contact.${index}.relationship`] = 'La relación es requerida';
        }
        if (!contact.phone?.trim()) {
          newErrors[`contact.${index}.phone`] = 'El teléfono es requerido';
        }
      });
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, [formData]);

  /**
   * Guarda los datos del paso 0 (Información básica e identidad)
   */
  const saveBasicInfoStep = useCallback(async (): Promise<{ success: boolean; prisonerId?: string }> => {
    try {
      setIsSubmitting(true);

      // 1. Crear o actualizar prisionero
      let prisonerId = formState.prisonerId;
      
      if (mode === 'create' && !prisonerId) {
        // Crear nuevo prisionero
        const prisonerData: CreatePrisonerData = {
          registration_number: formData.registration_number!,
          admission_date: formData.admission_date!,
          fiscal_file_number: formData.fiscal_file_number,
          status: formData.status || 'Activo'
        };

        const prisoner = await prisonersService.createPrisoner(prisonerData);
        prisonerId = prisoner.id;
        
        setFormState(prev => ({
          ...prev,
          prisoner,
          prisonerId
        }));

        notifications.show({
          title: 'Prisionero creado',
          message: 'Los datos básicos del prisionero se guardaron correctamente',
          color: 'green'
        });
      } else if (mode === 'edit' && prisonerId) {
        // Actualizar prisionero existente
        const prisonerData = {
          registration_number: formData.registration_number,
          admission_date: formData.admission_date,
          fiscal_file_number: formData.fiscal_file_number,
          status: formData.status
        };

        await prisonersService.updatePrisoner(prisonerId, prisonerData);
        
        notifications.show({
          title: 'Prisionero actualizado',
          message: 'Los datos básicos se actualizaron correctamente',
          color: 'blue'
        });
      }

      if (!prisonerId) {
        throw new Error('No se pudo obtener el ID del prisionero');
      }

      // 2. Crear o actualizar identidad
      if (formData.identity) {
        const identityData = {
          first_name: formData.identity.first_name!,
          surname: formData.identity.surname!,
          birth_date: formData.identity.birth_date 
            ? (formData.identity.birth_date instanceof Date 
                ? formData.identity.birth_date.toISOString().split('T')[0]
                : formData.identity.birth_date)
            : undefined,
          birth_place: formData.identity.birth_place,
          residence: formData.identity.residence,
          citizenship_type: formData.identity.citizenship_type,
          country_of_origin: formData.identity.country_of_origin,
          nationality: formData.identity.nationality,
          nationality_type: formData.identity.nationality_type,
        };

        try {
          if (mode === 'create') {
            await identityService.createIdentity(prisonerId, identityData);
          } else {
            await identityService.updateIdentity(prisonerId, identityData);
          }
          
          notifications.show({
            title: mode === 'create' ? 'Identidad creada' : 'Identidad actualizada',
            message: 'La información de identidad se guardó correctamente',
            color: 'green'
          });
        } catch (error: unknown) {
          // Si falla la identidad, mostrar error pero no bloquear
          const errMsg = error instanceof Error ? error.message : 'Ocurrió un error al guardar la identidad';
          notifications.show({
            title: 'Error al guardar identidad',
            message: errMsg,
            color: 'orange'
          });
        }
      }

      // 3. Subir archivos (foto y huellas)
      if (formState.photoFile && prisonerId) {
        try {
          await identityService.uploadPhoto(prisonerId, formState.photoFile);
          notifications.show({
            title: 'Foto subida',
            message: 'La foto de perfil se subió correctamente',
            color: 'green'
          });
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : 'No se pudo subir la foto';
          notifications.show({
            title: 'Error al subir foto',
            message: errMsg,
            color: 'orange'
          });
        }
      }

      if (formState.fingerprintRightFile && prisonerId) {
        try {
          await identityService.uploadFingerprint(prisonerId, formState.fingerprintRightFile, 'right');
          notifications.show({
            title: 'Huella derecha subida',
            message: 'La huella dactilar derecha se subió correctamente',
            color: 'green'
          });
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : 'No se pudo subir la huella';
          notifications.show({
            title: 'Error al subir huella derecha',
            message: errMsg,
            color: 'orange'
          });
        }
      }

      if (formState.fingerprintLeftFile && prisonerId) {
        try {
          await identityService.uploadFingerprint(prisonerId, formState.fingerprintLeftFile, 'left');
          notifications.show({
            title: 'Huella izquierda subida',
            message: 'La huella dactilar izquierda se subió correctamente',
            color: 'green'
          });
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : 'No se pudo subir la huella';
          notifications.show({
            title: 'Error al subir huella izquierda',
            message: errMsg,
            color: 'orange'
          });
        }
      }

      // Marcar paso como guardado
      setFormState(prev => ({
        ...prev,
        savedSteps: new Set([...prev.savedSteps, 0])
      }));

      return { success: true, prisonerId };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Ocurrió un error al guardar la información';
      notifications.show({
        title: 'Error al guardar',
        message: errMsg,
        color: 'red'
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, formData, formState]);

  /**
   * Guarda los datos del paso 1 (Información personal, hijos y pertenencias)
   */
  const savePersonalInfoStep = useCallback(async (): Promise<{ success: boolean }> => {
    if (!formState.prisonerId) {
      notifications.show({
        title: 'Error',
        message: 'No se encontró el ID del prisionero',
        color: 'red'
      });
      return { success: false };
    }

    try {
      setIsSubmitting(true);
      const prisonerId = formState.prisonerId;

      // 1. Guardar información personal
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

        try {
          if (mode === 'create') {
            await personalService.createPersonal(prisonerId, personalData);
          } else {
            await personalService.updatePersonal(prisonerId, {
              marital_status: formData.personal.marital_status,
              education_level: formData.personal.education_level,
              occupation: formData.personal.occupation,
              observations: formData.personal.observations,
            });
          }

          notifications.show({
            title: 'Información personal guardada',
            message: 'La información personal se guardó correctamente',
            color: 'green'
          });
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : 'Ocurrió un error al guardar';
          notifications.show({
            title: 'Error al guardar información personal',
            message: errMsg,
            color: 'orange'
          });
        }
      }

      // 2. Guardar hijos
      if (formData.child && formData.child.length > 0) {
        for (const child of formData.child) {
          if (child.name?.trim()) {
            try {
              const childData = {
                full_name: child.name,
                birth_date: child.birth_date
              };

              await childrenService.createChild(prisonerId, childData);
            } catch (error: unknown) {
              console.log(error);
              notifications.show({
                title: 'Error al guardar hijo',
                message: `No se pudo guardar: ${child.name}`,
                color: 'orange'
              });
            }
          }
        }

        notifications.show({
          title: 'Hijos registrados',
          message: `Se registraron ${formData.child.length} hijo(s) correctamente`,
          color: 'green'
        });
      }

      // 3. Guardar pertenencias
      if (formData.belongings && formData.belongings.length > 0) {
        for (const belonging of formData.belongings) {
          if (belonging.description?.trim()) {
            try {
              const belongingData = {
                description: belonging.description,
                quantity: belonging.quantity || 1,
                condition: belonging.condition,
                returned: belonging.is_returned || false
              };

              await belongingsService.createBelonging(prisonerId, belongingData);
            } catch (error: unknown) {
              console.log(error);
              notifications.show({
                title: 'Error al guardar pertenencia',
                message: `No se pudo guardar: ${belonging.description}`,
                color: 'orange'
              });
            }
          }
        }

        notifications.show({
          title: 'Pertenencias registradas',
          message: `Se registraron ${formData.belongings.length} pertenencia(s) correctamente`,
          color: 'green'
        });
      }

      // Marcar paso como guardado
      setFormState(prev => ({
        ...prev,
        savedSteps: new Set([...prev.savedSteps, 1])
      }));

      return { success: true };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Ocurrió un error al guardar la información personal';
      notifications.show({
        title: 'Error al guardar',
        message: errMsg,
        color: 'red'
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, formData, formState.prisonerId]);

  /**
   * Guarda los datos del paso 2 (Registros médicos)
   */
  const saveMedicalStep = useCallback(async (): Promise<{ success: boolean }> => {
    if (!formState.prisonerId) {
      notifications.show({
        title: 'Error',
        message: 'No se encontró el ID del prisionero',
        color: 'red'
      });
      return { success: false };
    }

    try {
      setIsSubmitting(true);
      const prisonerId = formState.prisonerId;

      // Guardar registros médicos
      if (formData.medical_record && formData.medical_record.length > 0) {
        for (const record of formData.medical_record) {
          if (record.doctor_name?.trim() && record.examination_date) {
            try {
              const medicalData = {
                doctor_name: record.doctor_name,
                examination_date: typeof record.examination_date === 'object' && record.examination_date !== null
                  ? (record.examination_date as Date).toISOString().split('T')[0]
                  : record.examination_date,
                reference_number: record.reference_number,
                notes: record.notes
              };

              await medicalRecordsService.createMedicalRecord(prisonerId, medicalData);
            } catch (error: unknown) {
              console.log(error);
              notifications.show({
                title: 'Error al guardar registro médico',
                message: `No se pudo guardar el registro del Dr. ${record.doctor_name}`,
                color: 'orange'
              });
            }
          }
        }

        notifications.show({
          title: 'Registros médicos guardados',
          message: `Se guardaron ${formData.medical_record.length} registro(s) médico(s)`,
          color: 'green'
        });
      }

      // Marcar paso como guardado
      setFormState(prev => ({
        ...prev,
        savedSteps: new Set([...prev.savedSteps, 2])
      }));

      return { success: true };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Ocurrió un error al guardar los registros médicos';
      notifications.show({
        title: 'Error al guardar',
        message: errMsg,
        color: 'red'
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, formState.prisonerId]);

  /**
   * Guarda los datos del paso 3 (Información penitenciaria)
   */
  const savePenitentiaryStep = useCallback(async (): Promise<{ success: boolean }> => {
    if (!formState.prisonerId) {
      notifications.show({
        title: 'Error',
        message: 'No se encontró el ID del prisionero',
        color: 'red'
      });
      return { success: false };
    }

    try {
      setIsSubmitting(true);
      const prisonerId = formState.prisonerId;

      // Guardar información penitenciaria
      if (formData.penitentiary) {
        const penitentiaryData = {
          category: formData.penitentiary.category as "DerechoComun" | "PrisionPreventiva" | "PrisioneroAcusado",
          building_number: formData.penitentiary.building_number,
          cell_number: formData.penitentiary.cell_number,
          bed_number: formData.penitentiary.bed_number
        };

        try {
          if (mode === 'create') {
            await penitentiaryService.createPenitentiary(prisonerId, penitentiaryData);
          } else {
            await penitentiaryService.updatePenitentiary(prisonerId, penitentiaryData);
          }

          notifications.show({
            title: 'Información penitenciaria guardada',
            message: 'La ubicación del prisionero se guardó correctamente',
            color: 'green'
          });
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : 'Ocurrió un error al guardar';
          notifications.show({
            title: 'Error al guardar información penitenciaria',
            message: errMsg,
            color: 'orange'
          });
        }
      }

      // Marcar paso como guardado
      setFormState(prev => ({
        ...prev,
        savedSteps: new Set([...prev.savedSteps, 3])
      }));

      return { success: true };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Ocurrió un error al guardar la información penitenciaria';
      notifications.show({
        title: 'Error al guardar',
        message: errMsg,
        color: 'red'
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, formData, formState.prisonerId]);

  /**
   * Guarda los datos del paso 4 (Contactos)
   */
  const saveContactsStep = useCallback(async (): Promise<{ success: boolean }> => {
    if (!formState.prisonerId) {
      notifications.show({
        title: 'Error',
        message: 'No se encontró el ID del prisionero',
        color: 'red'
      });
      return { success: false };
    }

    try {
      setIsSubmitting(true);
      const prisonerId = formState.prisonerId;

      // Guardar contactos
      if (formData.contacts && formData.contacts.length > 0) {
        for (const contact of formData.contacts) {
          if (contact.name?.trim() && contact.relationship?.trim()) {
            try {
              const contactData = {
                name: contact.name,
                relationship: contact.relationship,
                phone: contact.phone
              };

              await contactsService.createContact(prisonerId, contactData);
            } catch (error: unknown) {
              console.log(error);
              notifications.show({
                title: 'Error al guardar contacto',
                message: `No se pudo guardar: ${contact.name}`,
                color: 'orange'
              });
            }
          }
        }

        notifications.show({
          title: 'Contactos guardados',
          message: `Se guardaron ${formData.contacts.length} contacto(s) correctamente`,
          color: 'green'
        });
      }

      // Marcar paso como guardado
      setFormState(prev => ({
        ...prev,
        savedSteps: new Set([...prev.savedSteps, 4])
      }));

      return { success: true };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Ocurrió un error al guardar los contactos';
      notifications.show({
        title: 'Error al guardar',
        message: errMsg,
        color: 'red'
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, formState.prisonerId]);

  /**
   * Actualiza los datos del formulario (optimizado)
   */
  const handleDataUpdate = useCallback((updates: Partial<CreatePrisonerData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));

    // Limpiar errores solo si hay errores presentes
    setErrors(prev => {
      if (Object.keys(prev).length === 0) return prev;
      
      const updatedFields = Object.keys(updates);
      const newErrors = { ...prev };
      let hasChanges = false;
      
      updatedFields.forEach(field => {
        if (newErrors[field]) {
          delete newErrors[field];
          hasChanges = true;
        }
        Object.keys(newErrors).forEach(errorKey => {
          if (errorKey.startsWith(`${field}.`)) {
            delete newErrors[errorKey];
            hasChanges = true;
          }
        });
      });
      
      return hasChanges ? newErrors : prev;
    });
  }, []);

  /**
   * Actualiza los archivos para subir
   */
  const handleFileUpdate = useCallback((fileType: 'photo' | 'fingerprintLeft' | 'fingerprintRight', file: File) => {
    setFormState(prev => ({
      ...prev,
      photoFile: fileType === 'photo' ? file : prev.photoFile,
      fingerprintLeftFile: fileType === 'fingerprintLeft' ? file : prev.fingerprintLeftFile,
      fingerprintRightFile: fileType === 'fingerprintRight' ? file : prev.fingerprintRightFile,
    }));
  }, []);

  /**
   * Maneja el botón "Siguiente"
   */
  const handleNext = useCallback(async () => {
    // Validar paso actual
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

    // Si es el paso 0, guardar datos antes de avanzar
    if (activeStep === 0) {
      const result = await saveBasicInfoStep();
      
      if (!result.success) {
        return; // No avanzar si falla el guardado
      }

      // Actualizar el prisonerId en el estado si es nuevo
      if (result.prisonerId && !formState.prisonerId) {
        setFormState(prev => ({
          ...prev,
          prisonerId: result.prisonerId
        }));
      }
    }

    // Si es el paso 1, guardar información personal, hijos y pertenencias
    if (activeStep === 1) {
      const result = await savePersonalInfoStep();
      
      if (!result.success) {
        return; // No avanzar si falla el guardado
      }
    }

    // Si es el paso 2, guardar registros médicos
    if (activeStep === 2) {
      const result = await saveMedicalStep();
      
      if (!result.success) {
        return; // No avanzar si falla el guardado
      }
    }

    // Si es el paso 3, guardar información penitenciaria
    if (activeStep === 3) {
      const result = await savePenitentiaryStep();
      
      if (!result.success) {
        return; // No avanzar si falla el guardado
      }
    }

    // Si es el paso 4, guardar contactos
    if (activeStep === 4) {
      const result = await saveContactsStep();
      
      if (!result.success) {
        return; // No avanzar si falla el guardado
      }
    }

    // Avanzar al siguiente paso
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    setErrors({});
  }, [activeStep, validateStep, saveBasicInfoStep, savePersonalInfoStep, saveMedicalStep, savePenitentiaryStep, saveContactsStep, formState.prisonerId, steps.length]);

  /**
   * Maneja el botón "Anterior"
   */
  const handlePrevious = useCallback(() => {
    setActiveStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  }, []);

  /**
   * Maneja el botón "Cancelar"
   */
  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  /**
   * Maneja el botón "Finalizar" del último paso
   */
  const handleSubmit = useCallback(async () => {
    if (!formState.prisonerId) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo completar el registro',
        color: 'red'
      });
      return;
    }

    // Validar paso actual
    const validation = validateStep(activeStep);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Guardar datos del último paso si es necesario

      notifications.show({
        title: 'Registro completado',
        message: 'El prisionero se registró exitosamente',
        color: 'green'
      });

      // Llamar callback de éxito
      if (formState.prisoner) {
        onSuccess?.({
          prisoner: formState.prisoner,
          id: formState.prisonerId
        });
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Ocurrió un error al finalizar el registro';
      notifications.show({
        title: 'Error',
        message: errMsg,
        color: 'red'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [activeStep, formState, onSuccess, validateStep]);

  return {
    formData,
    errors,
    activeStep,
    isSubmitting,
    canGoNext: true,
    prisonerId: formState.prisonerId,
    savedSteps: formState.savedSteps,
    handleDataUpdate,
    handleFileUpdate,
    handlePrevious,
    handleNext,
    handleCancel,
    handleSubmit,
    steps
  };
}