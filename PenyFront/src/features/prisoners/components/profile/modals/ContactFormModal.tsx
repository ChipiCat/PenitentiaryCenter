import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Stack, Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { TextInputField } from '../../../../../shared/components/TextInputField';
import { contactsService } from '../../../../../shared/services/contactsService';
import type {
  Contact,
  CreateContactData,
  UpdateContactData,
} from '../../../../../shared/types/contactTypes';

interface ContactFormModalProps {
  prisonerId: string;
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  relationship: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  relationship?: string;
  phone?: string;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  prisonerId,
  contact,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditMode = !!contact;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    relationship: '',
    phone: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar formulario cuando se abre
  useEffect(() => {
    if (isOpen && contact) {
      setFormData({
        name: contact.name || '',
        relationship: contact.relationship || '',
        phone: contact.phone || '',
      });
    } else if (isOpen && !contact) {
      setFormData({
        name: '',
        relationship: '',
        phone: '',
      });
    }
    setErrors({});
  }, [isOpen, contact]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.relationship.trim()) {
      newErrors.relationship = 'La relación es requerida';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      notifications.show({
        title: 'Formulario incompleto',
        message: 'Por favor completa todos los campos requeridos',
        color: 'red',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && contact) {
        // Modo edición
        const updateData: UpdateContactData = {
          name: formData.name,
          relationship: formData.relationship,
          phone: formData.phone || undefined,
        };

        await contactsService.updateContact(prisonerId, contact.id, updateData);

        notifications.show({
          title: 'Éxito',
          message: 'Contacto actualizado correctamente',
          color: 'green',
        });
      } else {
        // Modo creación
        const createData: CreateContactData = {
          name: formData.name,
          relationship: formData.relationship,
          phone: formData.phone || undefined,
        };

        await contactsService.createContact(prisonerId, createData);

        notifications.show({
          title: 'Éxito',
          message: 'Contacto agregado correctamente',
          color: 'green',
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al guardar',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, isEditMode, contact, prisonerId, onSuccess, onClose]);

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Contacto' : 'Agregar Contacto'}
      centered
      size="md"
    >
      <Stack gap="md">
        <TextInputField
          label="Nombre Completo"
          placeholder="Ej: María García López"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <TextInputField
          label="Relación"
          placeholder="Ej: Madre, Hermano, Esposa..."
          value={formData.relationship}
          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          error={errors.relationship}
          required
        />

        <TextInputField
          label="Teléfono"
          placeholder="Ej: +595 981 123456"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
          required
        />

        <Group justify="flex-end" gap="xs" mt="md">
          <Button variant="light" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            {isEditMode ? 'Actualizar' : 'Agregar'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
