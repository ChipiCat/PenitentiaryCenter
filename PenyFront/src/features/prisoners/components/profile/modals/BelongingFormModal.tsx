import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Stack, Button, Group, NumberInput, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { TextInputField } from '../../../../../shared/components/TextInputField';
import { BelongingDropzone } from '../../../../../shared/components/BelongingDropzone';
import { belongingsService } from '../../../../../shared/services/belongingsService';
import type {
  Belonging,
  CreateBelongingData,
  UpdateBelongingData,
} from '../../../../../shared/types/belongingTypes';

interface BelongingFormModalProps {
  prisonerId: string;
  belonging: Belonging | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  description: string;
  quantity: number;
  condition: string;
}

interface FormErrors {
  description?: string;
  quantity?: string;
  condition?: string;
}

export const BelongingFormModal: React.FC<BelongingFormModalProps> = ({
  prisonerId,
  belonging,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditMode = !!belonging;

  const [formData, setFormData] = useState<FormData>({
    description: '',
    quantity: 1,
    condition: '',
  });

  const [file, setFile] = useState<File | undefined>(undefined);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar formulario cuando se abre
  useEffect(() => {
    if (isOpen && belonging) {
      setFormData({
        description: belonging.description || '',
        quantity: belonging.quantity || 1,
        condition: belonging.condition || '',
      });
    } else if (isOpen && !belonging) {
      setFormData({
        description: '',
        quantity: 1,
        condition: '',
      });
    }
    setFile(undefined);
    setErrors({});
  }, [isOpen, belonging]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
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
      if (isEditMode && belonging) {
        // Modo edición
        const updateData: UpdateBelongingData = {
          description: formData.description,
          quantity: formData.quantity,
          condition: formData.condition || undefined,
        };

        await belongingsService.updateBelonging(prisonerId, belonging.id, updateData);

        // Subir archivo si existe (puede ser nuevo o actualización)
        if (file) {
          await belongingsService.uploadInventory(prisonerId, belonging.id, file);
        }

        notifications.show({
          title: 'Éxito',
          message: 'Pertenencia actualizada correctamente',
          color: 'green',
        });
      } else {
        // Modo creación
        const createData: CreateBelongingData = {
          description: formData.description,
          quantity: formData.quantity,
          condition: formData.condition || undefined,
        };

        const createdBelonging = await belongingsService.createBelonging(
          prisonerId,
          createData
        );

        // Subir archivo si existe
        if (file && createdBelonging.id) {
          await belongingsService.uploadInventory(prisonerId, createdBelonging.id, file);
        }

        notifications.show({
          title: 'Éxito',
          message: 'Pertenencia agregada correctamente',
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
  }, [
    formData,
    file,
    validateForm,
    isEditMode,
    belonging,
    prisonerId,
    onSuccess,
    onClose,
  ]);

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Pertenencia' : 'Agregar Pertenencia'}
      centered
      size="md"
    >
      <Stack gap="md">
        <TextInputField
          label="Descripción"
          placeholder="Ej: Reloj de oro, cartera de cuero..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
          required
        />

        <NumberInput
          label="Cantidad"
          placeholder="1"
          value={formData.quantity}
          onChange={(value) => setFormData({ ...formData, quantity: Number(value) || 1 })}
          error={errors.quantity}
          min={1}
          required
        />

        <TextInputField
          label="Estado/Condición"
          placeholder="Ej: Nuevo, usado, dañado..."
          value={formData.condition}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          error={errors.condition}
        />

        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Inventario/Documento {isEditMode && '(actualizar)'}
          </Text>
          <BelongingDropzone onFile={(newFile) => setFile(newFile)} />
          {file && (
            <Text size="xs" c="dimmed">
              Archivo seleccionado: {file.name}
            </Text>
          )}
          {isEditMode && belonging?.file && !file && (
            <Text size="xs" c="blue">
              Ya existe un archivo. Sube uno nuevo para reemplazarlo.
            </Text>
          )}
        </Stack>

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
