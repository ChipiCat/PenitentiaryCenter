import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { medicalRecordsService } from '../../../../../shared/services/medicalRecordsService';
import type {
  MedicalRecord,
  CreateMedicalRecordData,
  UpdateMedicalRecordData,
} from '../../../../../shared/types/medicalRecordTypes';

interface UseMedicalRecordEditorProps {
  prisonerId: string;
  onSuccess?: () => void;
}

export const useMedicalRecordEditor = ({ prisonerId, onSuccess }: UseMedicalRecordEditorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==================== VALIDACIONES ====================
  const validateCreateData = useCallback((data: CreateMedicalRecordData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.doctor_name?.trim()) {
      newErrors.doctor_name = 'El nombre del doctor es requerido';
    }

    if (!data.examination_date) {
      newErrors.examination_date = 'La fecha del examen es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateUpdateData = useCallback((data: UpdateMedicalRecordData): boolean => {
    const newErrors: Record<string, string> = {};

    if (data.doctor_name !== undefined && !data.doctor_name?.trim()) {
      newErrors.doctor_name = 'El nombre del doctor no puede estar vacío';
    }

    if (data.examination_date !== undefined && !data.examination_date) {
      newErrors.examination_date = 'La fecha del examen no puede estar vacía';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  // ==================== CONTROL DE ESTADOS ====================
  const startCreating = useCallback(() => {
    setIsCreating(true);
    setEditingRecordId(null);
    setErrors({});
  }, []);

  const startEditing = useCallback((recordId: string) => {
    setEditingRecordId(recordId);
    setIsCreating(false);
    setErrors({});
  }, []);

  const cancelEditing = useCallback(() => {
    setIsCreating(false);
    setEditingRecordId(null);
    setErrors({});
  }, []);

  // ==================== CREAR REGISTRO MÉDICO ====================
  const createMedicalRecord = useCallback(
    async (data: CreateMedicalRecordData, file?: File): Promise<MedicalRecord | null> => {
      if (!validateCreateData(data)) {
        return null;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const newRecord = await medicalRecordsService.createMedicalRecord(prisonerId, data);

        // Si hay archivo, subirlo después de crear el registro
        if (file && newRecord.id) {
          await medicalRecordsService.uploadMedicalFile(prisonerId, newRecord.id, file);
        }

        notifications.show({
          title: 'Éxito',
          message: 'Registro médico creado correctamente',
          color: 'green',
        });

        cancelEditing();
        onSuccess?.();
        return newRecord;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al crear registro médico';
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

  // ==================== ACTUALIZAR REGISTRO MÉDICO ====================
  const updateMedicalRecord = useCallback(
    async (recordId: string, data: UpdateMedicalRecordData, file?: File): Promise<boolean> => {
      if (!validateUpdateData(data)) {
        return false;
      }

      setIsLoading(true);
      setErrors({});

      try {
        await medicalRecordsService.updateMedicalRecord(prisonerId, recordId, data);

        // Si hay archivo, subirlo después de actualizar
        if (file) {
          await medicalRecordsService.uploadMedicalFile(prisonerId, recordId, file);
        }

        notifications.show({
          title: 'Éxito',
          message: 'Registro médico actualizado correctamente',
          color: 'green',
        });

        cancelEditing();
        onSuccess?.();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al actualizar registro médico';
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
    [prisonerId, validateUpdateData, cancelEditing, onSuccess]
  );

  // ==================== ELIMINAR REGISTRO MÉDICO ====================
  const deleteMedicalRecord = useCallback(
    async (recordId: string): Promise<boolean> => {
      setIsLoading(true);

      try {
        await medicalRecordsService.deleteMedicalRecord(prisonerId, recordId);

        notifications.show({
          title: 'Éxito',
          message: 'Registro médico eliminado correctamente',
          color: 'green',
        });

        onSuccess?.();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar registro médico';
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
    [prisonerId, onSuccess]
  );

  // ==================== SUBIR ARCHIVO ====================
  const uploadMedicalFile = useCallback(
    async (recordId: string, file: File) => {
      return await medicalRecordsService.uploadMedicalFile(prisonerId, recordId, file);
    },
    [prisonerId]
  );

  return {
    // Estados
    isCreating,
    editingRecordId,
    isLoading,
    errors,

    // Acciones
    startCreating,
    startEditing,
    cancelEditing,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    uploadMedicalFile,
  };
};
