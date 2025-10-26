import { useState, useCallback } from 'react';
import { usePrisonerFormSteps } from './usePrisonerFormSteps';
import type { CreatePrisonerData, PrisonerBase } from '../../../../shared/types';

interface PrisonerFormWizardProps {
  mode?: 'create' | 'edit';
  initialData?: Partial<CreatePrisonerData>;
  onSuccess?: (result: { prisoner: PrisonerBase; id: string }) => void;
  onCancel?: () => void;
}

export function usePrisonerFormHandlers({ initialData, onCancel }: PrisonerFormWizardProps) {
  const steps = usePrisonerFormSteps();
  const [formData, setFormData] = useState<Partial<CreatePrisonerData>>(adaptInitialData(initialData));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);

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

  const handleDataUpdate = useCallback((updates: Partial<CreatePrisonerData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));

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

  return {
    formData,
    errors,
    activeStep,
    isSubmitting: false,
    canGoNext: true, 
    handleDataUpdate,
    handlePrevious: () => setActiveStep(prev => Math.max(prev - 1, 0)),
    handleNext: () => setActiveStep(prev => Math.min(prev + 1, steps.length - 1)),
    handleCancel: () => onCancel?.(),
    handleSubmit: async () => { },
    steps
  };
}