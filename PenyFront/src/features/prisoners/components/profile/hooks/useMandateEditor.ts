import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { mandatesService } from '../../../../../shared/services/mandatesService';
import type {
  Mandate,
  CreateMandatesData,
  UpdateMandateData,
} from '../../../../../shared/types/caseTypes';

interface UseMandateEditorProps {
  caseId: string;
  onSuccess?: () => void;
}

export const useMandateEditor = ({ caseId, onSuccess }: UseMandateEditorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingMandateId, setEditingMandateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==================== VALIDACIONES ====================
  const validateCreateData = useCallback((data: CreateMandatesData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.type) {
      newErrors.type = 'El tipo de mandato es requerido';
    }

    if (!data.issue_date) {
      newErrors.issue_date = 'La fecha de emisión es requerida';
    }

    if (!data.status) {
      newErrors.status = 'El estado es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateUpdateData = useCallback((data: UpdateMandateData): boolean => {
    const newErrors: Record<string, string> = {};

    if (data.type !== undefined && !data.type) {
      newErrors.type = 'El tipo de mandato no puede estar vacío';
    }

    if (data.issue_date !== undefined && !data.issue_date) {
      newErrors.issue_date = 'La fecha de emisión no puede estar vacía';
    }

    if (data.status !== undefined && !data.status) {
      newErrors.status = 'El estado no puede estar vacío';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  // ==================== CONTROL DE ESTADOS ====================
  const startCreating = useCallback(() => {
    setIsCreating(true);
    setEditingMandateId(null);
    setErrors({});
  }, []);

  const startEditing = useCallback((mandateId: string) => {
    setEditingMandateId(mandateId);
    setIsCreating(false);
    setErrors({});
  }, []);

  const cancelEditing = useCallback(() => {
    setIsCreating(false);
    setEditingMandateId(null);
    setErrors({});
  }, []);

  // ==================== CREAR MANDATO ====================
  const createMandate = useCallback(
    async (data: CreateMandatesData, file?: File): Promise<Mandate | null> => {
      if (!validateCreateData(data)) {
        return null;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const newMandate = await mandatesService.createMandate(caseId, data);

        // Si hay archivo, subirlo después de crear el mandato
        if (file && newMandate.id) {
          await mandatesService.uploadMandateFile(newMandate.id, file);
        }

        notifications.show({
          title: 'Éxito',
          message: 'Mandato judicial creado correctamente',
          color: 'green',
        });

        cancelEditing();
        onSuccess?.();
        return newMandate;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al crear mandato';
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
    [caseId, validateCreateData, cancelEditing, onSuccess]
  );

  // ==================== ACTUALIZAR MANDATO ====================
  const updateMandate = useCallback(
    async (mandateId: string, data: UpdateMandateData, file?: File): Promise<boolean> => {
      if (!validateUpdateData(data)) {
        return false;
      }

      setIsLoading(true);
      setErrors({});

      try {
        await mandatesService.updateMandate(mandateId, data);

        // Si hay archivo, subirlo después de actualizar
        if (file) {
          await mandatesService.uploadMandateFile(mandateId, file);
        }

        notifications.show({
          title: 'Éxito',
          message: 'Mandato judicial actualizado correctamente',
          color: 'green',
        });

        cancelEditing();
        onSuccess?.();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al actualizar mandato';
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

  // ==================== ELIMINAR MANDATO ====================
  const deleteMandate = useCallback(
    async (mandateId: string): Promise<boolean> => {
      setIsLoading(true);

      try {
        await mandatesService.deleteMandate(mandateId);

        notifications.show({
          title: 'Éxito',
          message: 'Mandato judicial eliminado correctamente',
          color: 'green',
        });

        onSuccess?.();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar mandato';
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

  // ==================== SUBIR ARCHIVO ====================
  const uploadMandateFile = useCallback(
    async (mandateId: string, file: File) => {
      return await mandatesService.uploadMandateFile(mandateId, file);
    },
    []
  );

  return {
    // Estados
    isCreating,
    editingMandateId,
    isLoading,
    errors,

    // Acciones
    startCreating,
    startEditing,
    cancelEditing,
    createMandate,
    updateMandate,
    deleteMandate,
    uploadMandateFile,
  };
};
