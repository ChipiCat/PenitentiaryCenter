import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { childrenService } from '../../../../../shared/services/childrenService';

/**
 * Hook para gestionar operaciones CRUD de hijos
 */
export const useChildrenManager = (prisonerId: string, onUpdate: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteChild = useCallback(async (childId: string) => {
    setIsDeleting(true);
    try {
      await childrenService.deleteChild(prisonerId, childId);
      notifications.show({
        title: 'Éxito',
        message: 'Hijo eliminado correctamente',
        color: 'green',
      });
      onUpdate();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al eliminar hijo',
        color: 'red',
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [prisonerId, onUpdate]);

  return {
    deleteChild,
    isDeleting,
  };
};
