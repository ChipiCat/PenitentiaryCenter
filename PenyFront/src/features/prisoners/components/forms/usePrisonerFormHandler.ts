import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { usePrisonerFormSteps } from './usePrisonerFormSteps';
import { prisonersService } from '../../../../shared/services/prisonersService';
import { identityService } from '../../../../shared/services/identityService';
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
        } catch (error: any) {
          // Si falla la identidad, mostrar error pero no bloquear
          notifications.show({
            title: 'Error al guardar identidad',
            message: error.message || 'Ocurrió un error al guardar la identidad',
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
        } catch (error: any) {
          notifications.show({
            title: 'Error al subir foto',
            message: error.message || 'No se pudo subir la foto',
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
        } catch (error: any) {
          notifications.show({
            title: 'Error al subir huella derecha',
            message: error.message || 'No se pudo subir la huella',
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
        } catch (error: any) {
          notifications.show({
            title: 'Error al subir huella izquierda',
            message: error.message || 'No se pudo subir la huella',
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
    } catch (error: any) {
      notifications.show({
        title: 'Error al guardar',
        message: error.message || 'Ocurrió un error al guardar la información',
        color: 'red'
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, formData, formState]);

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

    // TODO: Implementar guardado para otros pasos aquí
    // Ejemplo:
    // if (activeStep === 1) {
    //   await savePersonalInfoStep();
    // }

    // Avanzar al siguiente paso
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    setErrors({});
  }, [activeStep, validateStep, saveBasicInfoStep, formState.prisonerId, steps.length]);

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
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Ocurrió un error al finalizar el registro',
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