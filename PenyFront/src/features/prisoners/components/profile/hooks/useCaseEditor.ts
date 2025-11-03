import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { casesService } from '../../../../../shared/services/casesService';
import type {
  Case,
  CreateCaseData,
  UpdateCaseData,
} from '../../../../../shared/types/caseTypes';

interface UseCaseEditorProps {
  prisonerId: string;
  onSuccess?: () => void;
}

export const useCaseEditor = ({ prisonerId, onSuccess }: UseCaseEditorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==================== VALIDACIONES ====================
  const validateCreateData = useCallback((data: CreateCaseData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.case_number?.trim()) {
      newErrors.case_number = 'El número de caso es requerido';
    }

    if (!data.crime?.trim()) {
      newErrors.crime = 'El delito/crimen es requerido';
    }

    if (!data.status) {
      newErrors.status = 'El estado es requerido';
    }

    if (!data.start_date) {
      newErrors.start_date = 'La fecha de inicio es requerida';
    }

    if (!data.court_name?.trim()) {
      newErrors.court_name = 'El nombre del juzgado es requerido';
    }

    if (!data.judge_name?.trim()) {
      newErrors.judge_name = 'El nombre del juez es requerido';
    }

    if (data.sentence_years === undefined || data.sentence_years < 0) {
      newErrors.sentence_years = 'Los años de sentencia son requeridos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateUpdateData = useCallback((data: UpdateCaseData): boolean => {
    const newErrors: Record<string, string> = {};

    if (data.case_number !== undefined && !data.case_number?.trim()) {
      newErrors.case_number = 'El número de caso no puede estar vacío';
    }

    if (data.crime !== undefined && !data.crime?.trim()) {
      newErrors.crime = 'El delito/crimen no puede estar vacío';
    }

    if (data.court_name !== undefined && !data.court_name?.trim()) {
      newErrors.court_name = 'El nombre del juzgado no puede estar vacío';
    }

    if (data.judge_name !== undefined && !data.judge_name?.trim()) {
      newErrors.judge_name = 'El nombre del juez no puede estar vacío';
    }

    if (data.sentence_years !== undefined && data.sentence_years < 0) {
      newErrors.sentence_years = 'Los años de sentencia no pueden ser negativos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  // ==================== CONTROL DE ESTADOS ====================
  const startCreating = useCallback(() => {
    setIsCreating(true);
    setEditingCaseId(null);
    setErrors({});
  }, []);

  const startEditing = useCallback((caseId: string) => {
    setEditingCaseId(caseId);
    setIsCreating(false);
    setErrors({});
  }, []);

  const cancelEditing = useCallback(() => {
    setIsCreating(false);
    setEditingCaseId(null);
    setErrors({});
  }, []);

  // ==================== CREAR CASO ====================
  const createCase = useCallback(
    async (data: CreateCaseData): Promise<Case | null> => {
      if (!validateCreateData(data)) {
        return null;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const newCase = await casesService.createCase(prisonerId, data);

        notifications.show({
          title: 'Éxito',
          message: 'Caso judicial creado correctamente',
          color: 'green',
        });

        cancelEditing();
        onSuccess?.();
        return newCase;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al crear caso';
        notifications.show({
          title: 'Error',
          message: errorMessage,
          color: 'red',
        });
        setErrors({ general: errorMessage });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [prisonerId, validateCreateData, cancelEditing, onSuccess]
  );

  // ==================== ACTUALIZAR CASO ====================
  const updateCase = useCallback(
    async (caseId: string, data: UpdateCaseData): Promise<boolean> => {
      if (!validateUpdateData(data)) {
        return false;
      }

      setIsLoading(true);
      setErrors({});

      try {
        await casesService.updateCase(caseId, data);

        notifications.show({
          title: 'Éxito',
          message: 'Caso judicial actualizado correctamente',
          color: 'green',
        });

        cancelEditing();
        onSuccess?.();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al actualizar caso';
        notifications.show({
          title: 'Error',
          message: errorMessage,
          color: 'red',
        });
        setErrors({ general: errorMessage });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [validateUpdateData, cancelEditing, onSuccess]
  );

  // ==================== ELIMINAR CASO ====================
  const deleteCase = useCallback(
    async (caseId: string): Promise<boolean> => {
      setIsLoading(true);

      try {
        await casesService.deleteCase(caseId);

        notifications.show({
          title: 'Éxito',
          message: 'Caso judicial eliminado correctamente',
          color: 'green',
        });

        onSuccess?.();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar caso';
        notifications.show({
          title: 'Error',
          message: errorMessage,
          color: 'red',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess]
  );

  return {
    // Estados
    isCreating,
    editingCaseId,
    isLoading,
    errors,

    // Acciones
    startCreating,
    startEditing,
    cancelEditing,
    createCase,
    updateCase,
    deleteCase,
  };
};
