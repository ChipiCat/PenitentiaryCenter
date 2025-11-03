import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { belongingsService } from '../../../../../shared/services/belongingsService';

/**
 * Hook para gestionar operaciones CRUD de pertenencias
 */
export const useBelongingsManager = (prisonerId: string, onUpdate: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const deleteBelonging = useCallback(async (belongingId: string) => {
    setIsDeleting(true);
    try {
      await belongingsService.deleteBelonging(prisonerId, belongingId);
      notifications.show({
        title: 'Éxito',
        message: 'Pertenencia eliminada correctamente',
        color: 'green',
      });
      onUpdate();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al eliminar pertenencia',
        color: 'red',
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [prisonerId, onUpdate]);

  const markAsReturned = useCallback(async (belongingId: string) => {
    setIsUpdating(true);
    try {
      await belongingsService.markAsReturned(prisonerId, belongingId);
      notifications.show({
        title: 'Éxito',
        message: 'Pertenencia marcada como devuelta',
        color: 'green',
      });
      onUpdate();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al actualizar pertenencia',
        color: 'red',
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [prisonerId, onUpdate]);

  return {
    deleteBelonging,
    markAsReturned,
    isDeleting,
    isUpdating,
  };
};
