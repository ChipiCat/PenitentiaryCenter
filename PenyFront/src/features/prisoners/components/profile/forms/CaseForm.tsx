import React, { useState } from 'react';
import { Stack, TextInput, Textarea, Button, Group, Select, NumberInput } from '@mantine/core';
import type {
  Case,
  CreateCaseData,
  UpdateCaseData,
} from '../../../../../shared/types/caseTypes';

interface CaseFormProps {
  mode: 'create' | 'edit';
  initialData?: Case;
  onSubmit: (data: CreateCaseData | UpdateCaseData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  errors?: Record<string, string>;
}

const STATUS_OPTIONS = [
  { value: 'EnProceso', label: 'En Proceso' },
  { value: 'Condenado', label: 'Condenado' },
  { value: 'Apelacion', label: 'Apelación' },
  { value: 'Cerrado', label: 'Cerrado' },
];

/**
 * Formulario reutilizable para crear o editar casos judiciales
 * 
 * @param mode - Modo del formulario: 'create' o 'edit'
 * @param initialData - Datos iniciales para modo edición
 * @param onSubmit - Función async que maneja el envío del formulario
 * @param onCancel - Función que maneja la cancelación
 * @param isLoading - Estado de carga del formulario
 * @param errors - Objeto con errores de validación
 */
export const CaseForm: React.FC<CaseFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  errors = {},
}) => {
  const [formData, setFormData] = useState<CreateCaseData>({
    case_number: initialData?.case_number || '',
    crime: initialData?.crime || '',
    status: initialData?.status || 'EnProceso',
    start_date: initialData?.start_date 
      ? new Date(initialData.start_date).toISOString().split('T')[0] 
      : '',
    end_date: initialData?.end_date 
      ? new Date(initialData.end_date).toISOString().split('T')[0] 
      : '',
    court_name: initialData?.court_name || '',
    judge_name: initialData?.judge_name || '',
    sentence_years: initialData?.sentence_years || 0,
    remarks: initialData?.remarks || '',
  });

  const handleChange = (field: keyof CreateCaseData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      await onSubmit(formData);
    } else {
      // En modo edición, solo enviamos los campos modificados
      const updatedData: UpdateCaseData = {};
      if (formData.case_number !== initialData?.case_number) {
        updatedData.case_number = formData.case_number;
      }
      if (formData.crime !== initialData?.crime) {
        updatedData.crime = formData.crime;
      }
      if (formData.status !== initialData?.status) {
        updatedData.status = formData.status as 'EnProceso' | 'Condenado' | 'Apelacion' | 'Cerrado';
      }
      if (formData.start_date !== initialData?.start_date) {
        updatedData.start_date = formData.start_date;
      }
      if (formData.end_date !== initialData?.end_date) {
        updatedData.end_date = formData.end_date;
      }
      if (formData.court_name !== initialData?.court_name) {
        updatedData.court_name = formData.court_name;
      }
      if (formData.judge_name !== initialData?.judge_name) {
        updatedData.judge_name = formData.judge_name;
      }
      if (formData.sentence_years !== initialData?.sentence_years) {
        updatedData.sentence_years = formData.sentence_years;
      }
      if (formData.remarks !== initialData?.remarks) {
        updatedData.remarks = formData.remarks;
      }
      
      await onSubmit(updatedData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Número de Caso"
          placeholder="CASO-2025-001212"
          value={formData.case_number}
          onChange={(e) => handleChange('case_number', e.currentTarget.value)}
          error={errors.case_number}
          required
          disabled={isLoading}
        />

        <TextInput
          label="Delito/Crimen"
          placeholder="Asesinato, Robo con violencia armada, etc."
          value={formData.crime}
          onChange={(e) => handleChange('crime', e.currentTarget.value)}
          error={errors.crime}
          required
          disabled={isLoading}
        />

        <Select
          label="Estado del Caso"
          placeholder="Selecciona el estado"
          value={formData.status}
          onChange={(value) => handleChange('status', value || 'EnProceso')}
          data={STATUS_OPTIONS}
          error={errors.status}
          required
          disabled={isLoading}
        />

        <Group grow>
          <TextInput
            label="Fecha de Inicio"
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.currentTarget.value)}
            error={errors.start_date}
            required
            disabled={isLoading}
          />

          <TextInput
            label="Fecha de Fin (Opcional)"
            type="date"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.currentTarget.value)}
            error={errors.end_date}
            disabled={isLoading}
          />
        </Group>

        <TextInput
          label="Nombre del Juzgado"
          placeholder="Juzgado Penal del Distrito"
          value={formData.court_name}
          onChange={(e) => handleChange('court_name', e.currentTarget.value)}
          error={errors.court_name}
          required
          disabled={isLoading}
        />

        <TextInput
          label="Nombre del Juez"
          placeholder="Juez María González"
          value={formData.judge_name}
          onChange={(e) => handleChange('judge_name', e.currentTarget.value)}
          error={errors.judge_name}
          required
          disabled={isLoading}
        />

        <NumberInput
          label="Años de Sentencia"
          placeholder="5"
          value={formData.sentence_years}
          onChange={(value) => handleChange('sentence_years', Number(value) || 0)}
          error={errors.sentence_years}
          min={0}
          required
          disabled={isLoading}
        />

        <Textarea
          label="Observaciones (Opcional)"
          placeholder="Sentencia dictada en primera instancia..."
          value={formData.remarks}
          onChange={(e) => handleChange('remarks', e.currentTarget.value)}
          error={errors.remarks}
          minRows={3}
          disabled={isLoading}
        />

        {errors.general && (
          <div style={{ color: 'var(--mantine-color-red-6)', fontSize: '14px' }}>
            {errors.general}
          </div>
        )}

        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
          >
            {mode === 'create' ? 'Crear Caso' : 'Guardar Cambios'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
