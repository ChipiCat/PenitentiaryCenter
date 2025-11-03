import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Stack, Button, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { TextInputField } from '../../../../../shared/components/TextInputField';
import { childrenService } from '../../../../../shared/services/childrenService';
import type { Child, CreateChildData, UpdateChildData } from '../../../../../shared/types/childTypes';

interface ChildFormModalProps {
  prisonerId: string;
  child: Child | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  full_name: string;
  birth_date?: Date;
}

interface FormErrors {
  full_name?: string;
  birth_date?: string;
}

export const ChildFormModal: React.FC<ChildFormModalProps> = ({
  prisonerId,
  child,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditMode = !!child;
  
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    birth_date: undefined,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar formulario cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && child) {
      setFormData({
        full_name: child.full_name || '',
        birth_date: child.birth_date ? new Date(child.birth_date) : undefined,
      });
    } else if (isOpen && !child) {
      setFormData({
        full_name: '',
        birth_date: undefined,
      });
    }
    setErrors({});
  }, [isOpen, child]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es requerido';
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
      if (isEditMode && child) {
        // Modo edición
        const updateData: UpdateChildData = {
          full_name: formData.full_name,
          birth_date: formData.birth_date?.toISOString().split('T')[0],
        };
        
        await childrenService.updateChild(prisonerId, child.id, updateData);
        
        notifications.show({
          title: 'Éxito',
          message: 'Hijo actualizado correctamente',
          color: 'green',
        });
      } else {
        // Modo creación
        const createData: CreateChildData = {
          full_name: formData.full_name,
          birth_date: formData.birth_date?.toISOString().split('T')[0],
        };
        
        await childrenService.createChild(prisonerId, createData);
        
        notifications.show({
          title: 'Éxito',
          message: 'Hijo agregado correctamente',
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
  }, [formData, validateForm, isEditMode, child, prisonerId, onSuccess, onClose]);

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Hijo' : 'Agregar Hijo'}
      centered
      size="md"
    >
      <Stack gap="md">
        <TextInputField
          label="Nombre Completo"
          placeholder="Ej: Juan Pérez García"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          error={errors.full_name}
          required
        />

        <DatePickerInput
          label="Fecha de Nacimiento"
          placeholder="Selecciona la fecha"
          value={formData.birth_date}
          onChange={(date) => {
            const parsedDate = date ? new Date(date) : undefined;
            setFormData({ ...formData, birth_date: parsedDate });
          }}
          error={errors.birth_date}
          maxDate={new Date()}
          clearable
        />

        <Group justify="flex-end" gap="xs" mt="md">
          <Button
            variant="light"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            {isEditMode ? 'Actualizar' : 'Agregar'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
