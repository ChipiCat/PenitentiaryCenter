import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { penitentiaryService } from '../../../../../shared/services/penitentiaryService';
import type { UpdatePenitentiaryData } from '../../../../../shared/types/penitentiaryTypes';

interface UsePenitentiaryEditorProps {
  prisonerId: string;
  onSuccess?: () => void;
}

interface ValidationErrors {
  penitentiary?: Record<string, string>;
}

export const usePenitentiaryEditor = ({ prisonerId, onSuccess }: UsePenitentiaryEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // ==================== VALIDACIONES ====================
  const validatePenitentiaryData = useCallback((data: Partial<UpdatePenitentiaryData>): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validaciones opcionales: los campos pueden estar vacíos
    // pero si se llenan, deben tener formato válido
    
    if (data.building_number && data.building_number.trim() === '') {
      errors.building_number = 'El edificio no puede estar vacío si se especifica';
    }

    if (data.cell_number && data.cell_number.trim() === '') {
      errors.cell_number = 'La celda no puede estar vacía si se especifica';
    }

    if (data.bed_number && data.bed_number.trim() === '') {
      errors.bed_number = 'La cama no puede estar vacía si se especifica';
    }

    return errors;
  }, []);

  // ==================== ACTUALIZACIÓN ====================
  const updatePenitentiary = useCallback(async (penitentiaryData: Partial<UpdatePenitentiaryData>) => {
    // Validar datos
    const penitentiaryErrors = validatePenitentiaryData(penitentiaryData);

    if (Object.keys(penitentiaryErrors).length > 0) {
      setErrors({
        penitentiary: penitentiaryErrors,
      });
      return false;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await penitentiaryService.updatePenitentiary(prisonerId, penitentiaryData);

      notifications.show({
        title: 'Éxito',
        message: 'Ubicación penitenciaria actualizada correctamente',
        color: 'green',
      });

      setIsEditing(false);
      onSuccess?.();
      return true;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al actualizar ubicación penitenciaria',
        color: 'red',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [prisonerId, onSuccess, validatePenitentiaryData]);

  // ==================== CONTROLES DE EDICIÓN ====================
  const startEditing = useCallback(() => {
    setIsEditing(true);
    setErrors({});
  }, []);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setErrors({});
  }, []);

  return {
    // Estados
    isEditing,
    isLoading,
    errors,
    
    // Acciones
    updatePenitentiary,
    startEditing,
    cancelEditing,
  };
};
