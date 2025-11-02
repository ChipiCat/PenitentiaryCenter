import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { contactsService } from '../../../../../shared/services/contactsService';

/**
 * Hook para gestionar operaciones CRUD de contactos
 */
export const useContactsManager = (prisonerId: string, onUpdate: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteContact = useCallback(async (contactId: string) => {
    setIsDeleting(true);
    try {
      await contactsService.deleteContact(prisonerId, contactId);
      notifications.show({
        title: 'Éxito',
        message: 'Contacto eliminado correctamente',
        color: 'green',
      });
      onUpdate();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al eliminar contacto',
        color: 'red',
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [prisonerId, onUpdate]);

  return {
    deleteContact,
    isDeleting,
  };
};
