import React, { useState } from 'react';
import { Card, Stack, Group, Button, Select, Title } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { UserCircle2 } from 'lucide-react';
import type { CompletePrisonerProfile } from '../../../../../shared/types';
import type { UpdatePrisonerData } from '../../../../../shared/types/prisonerTypes';
import type { UpdateIdentityData } from '../../../../../shared/types/identityTypes';
import { OptimizedTextInput } from '../../forms/OptimizedInput';
import { TextareaField } from '../../../../../shared/components/TextareaField';

interface MainInfoEditFormProps {
  profile: CompletePrisonerProfile;
  onSave: (prisonerData: Partial<UpdatePrisonerData>, identityData: Partial<UpdateIdentityData>) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
  errors?: {
    prisoner?: Record<string, string>;
    identity?: Record<string, string>;
  };
}

const parseISODate = (isoString: string): Date | null => {
  try {
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

export const MainInfoEditForm: React.FC<MainInfoEditFormProps> = ({
  profile,
  onSave,
  onCancel,
  isLoading,
  errors = {},
}) => {
  // ==================== ESTADO DEL FORMULARIO ====================
  const [prisonerData, setPrisonerData] = useState<Partial<UpdatePrisonerData>>({
    registration_number: profile.prisoner?.registration_number ?? '',
    fiscal_file_number: profile.prisoner?.fiscal_file_number ?? '',
    status: profile.prisoner?.status ?? 'Activo',
  });

  const [identityData, setIdentityData] = useState<Partial<UpdateIdentityData>>({
    first_name: profile.identity?.first_name ?? '',
    surname: profile.identity?.surname ?? '',
    birth_date: profile.identity?.birth_date ?? '',
    birth_place: profile.identity?.birth_place ?? '',
    residence: profile.identity?.residence ?? '',
    citizenship_type: profile.identity?.citizenship_type ?? '',
    country_of_origin: profile.identity?.country_of_origin ?? '',
    nationality: profile.identity?.nationality ?? '',
  });

  // ==================== MANEJADORES ====================
  const handlePrisonerChange = (field: keyof UpdatePrisonerData, value: string) => {
    setPrisonerData(prev => ({ ...prev, [field]: value }));
  };

  const handleIdentityChange = (field: keyof UpdateIdentityData, value: string | Date | undefined) => {
    setIdentityData(prev => ({
      ...prev,
      [field]: value instanceof Date ? value.toISOString() : value,
    }));
  };

  const handleSubmit = async () => {
    const success = await onSave(prisonerData, identityData);
    if (!success) {
      // Los errores ya están manejados en el hook
    }
  };

  return (
    <Stack gap="md">
      <Card withBorder padding="lg" className="relative">
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <UserCircle2 size={20} />
            <Title order={4} size="h5">
              Editar Información Principal
            </Title>
          </Group>
        </Group>

        <Stack gap="md">
          {/* Información del Prisionero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OptimizedTextInput
              label="Número de Registro Penitenciario"
              placeholder="Ej: REG-2024-001"
              value={prisonerData.registration_number ?? ''}
              onChange={(value: string) => handlePrisonerChange('registration_number', value)}
              required
              error={errors.prisoner?.registration_number}
            />

            <OptimizedTextInput
              label="Número de Expediente Fiscal"
              placeholder="Ej: EXP-2024-FISCAL-001"
              value={prisonerData.fiscal_file_number ?? ''}
              onChange={(value: string) => handlePrisonerChange('fiscal_file_number', value)}
              required
              error={errors.prisoner?.fiscal_file_number}
            />
          </div>

          <Select
            label="Estado"
            placeholder="Seleccione el estado"
            value={prisonerData.status}
            onChange={(value) => handlePrisonerChange('status', value ?? 'Activo')}
            data={[
              { value: 'Activo', label: 'Activo' },
              { value: 'Trasladado', label: 'Trasladado' },
              { value: 'Liberado', label: 'Liberado' },
              { value: 'Archivado', label: 'Archivado' },
            ]}
            required
            error={errors.prisoner?.status}
          />

          {/* Información de Identidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OptimizedTextInput
              label="Apellidos"
              placeholder="Ingrese los apellidos"
              value={identityData.surname ?? ''}
              onChange={(value: string) => handleIdentityChange('surname', value)}
              required
              error={errors.identity?.surname}
            />

            <OptimizedTextInput
              label="Nombres"
              placeholder="Ingrese los nombres"
              value={identityData.first_name ?? ''}
              onChange={(value: string) => handleIdentityChange('first_name', value)}
              required
              error={errors.identity?.first_name}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePickerInput
              label="Fecha de Nacimiento"
              placeholder="Seleccione la fecha"
              value={identityData.birth_date ? parseISODate(identityData.birth_date) : null}
              onChange={(date) => handleIdentityChange('birth_date', date ?? undefined)}
              maxDate={new Date()}
            />

            <OptimizedTextInput
              label="Lugar de Nacimiento"
              placeholder="Ciudad, Departamento"
              value={identityData.birth_place ?? ''}
              onChange={(value: string) => handleIdentityChange('birth_place', value)}
              required
              error={errors.identity?.birth_place}
            />
          </div>

          <TextareaField
            label="Domicilio/Residencia"
            placeholder="Dirección completa de residencia"
            value={identityData.residence ?? ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleIdentityChange('residence', e.target.value)}
            minRows={2}
            required
            error={errors.identity?.residence}
            debounce={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Ciudadanía"
              placeholder="Seleccione el tipo"
              value={identityData.citizenship_type}
              onChange={(value) => handleIdentityChange('citizenship_type', value ?? '')}
              data={[
                { value: 'Local', label: 'Local' },
                { value: 'CiudadanoNacional', label: 'Ciudadano Nacional' },
                { value: 'CiudadanoExtranjero', label: 'Ciudadano Extranjero' },
              ]}
              required
              error={errors.identity?.citizenship_type}
            />

            <OptimizedTextInput
              label="País de Origen"
              placeholder="Ej: Bolivia"
              value={identityData.country_of_origin ?? ''}
              onChange={(value: string) => handleIdentityChange('country_of_origin', value)}
              required
              error={errors.identity?.country_of_origin}
            />
          </div>

          <OptimizedTextInput
            label="Nacionalidad"
            placeholder="Ej: Boliviana"
            value={identityData.nationality ?? ''}
            onChange={(value: string) => handleIdentityChange('nationality', value)}
            required
            error={errors.identity?.nationality}
          />

          {/* Botones de Acción */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isLoading}
            >
              Guardar Cambios
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};
