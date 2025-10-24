import { useState, useCallback } from 'react';
import { usePrisonerFormSteps } from './usePrisonerFormSteps';
import type { CreatePrisonerData, PrisonerBase } from '../../../../shared/types';

interface PrisonerFormWizardProps {
  mode?: 'create' | 'edit';
  initialData?: Partial<CreatePrisonerData>;
  onSuccess?: (result: { prisoner: PrisonerBase; id: string }) => void;
  onCancel?: () => void;
}


export function usePrisonerFormHandlers({ mode, initialData, onSuccess, onCancel }: PrisonerFormWizardProps) {
  const steps = usePrisonerFormSteps();
  const [formData, setFormData] = useState<Partial<CreatePrisonerData>>(adaptInitialData(initialData));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Adaptar datos iniciales
  function adaptInitialData(data: Partial<CreatePrisonerData> | PrisonerBase | undefined): Partial<CreatePrisonerData> {
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

  // Handlers y validaciones (igual que tu código actual, pero modularizado)
  // ...handleDataUpdate, isStepValid, validateStepWithErrors, handleNext, handlePrevious, handleCancel, handleSubmit...

  // Ejemplo de handleDataUpdate:
  const handleDataUpdate = useCallback((updates: Partial<CreatePrisonerData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    // Limpiar errores del campo actualizado
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        delete newErrors[field];
        Object.keys(newErrors).forEach(errorKey => {
          if (errorKey.startsWith(`${field}.`)) {
            delete newErrors[errorKey];
          }
        });
      });
      return newErrors;
    });
  }, []);

  // ...Resto de handlers y lógica igual que tu código actual...

  return {
    formData,
    errors,
    activeStep,
    isSubmitting,
    canGoNext: true, // Calcula según tu lógica
    handleDataUpdate,
    handlePrevious: () => setActiveStep(prev => Math.max(prev - 1, 0)),
    handleNext: () => setActiveStep(prev => Math.min(prev + 1, steps.length - 1)),
    handleCancel: () => onCancel?.(),
    handleSubmit: async () => { /* tu lógica de submit aquí */ },
    steps
  };
}