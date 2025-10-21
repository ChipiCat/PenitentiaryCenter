import React from 'react';
import { 
  TextInput, 
  Select, 
  Group, 
  Stack, 
  Textarea,
  Title,
  Card
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { 
  CreatePrisonerData,
  CitizenshipType
} from '../../../../shared/types/prisoners';

interface BasicInfoStepProps {
  data: Partial<CreatePrisonerData>;
  onUpdate: (updates: Partial<CreatePrisonerData>) => void;
  errors?: Record<string, string>;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ 
  data, 
  onUpdate, 
  errors = {} 
}) => {
  
  const handleMainDataChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleIdentityChange = (field: string, value: any) => {
    onUpdate({
      identity: {
        surname: data.identity?.surname || '',
        first_name: data.identity?.first_name || '',
        birth_date: data.identity?.birth_date,
        birth_place: data.identity?.birth_place,
        residence: data.identity?.residence,
        citizenship_type: data.identity?.citizenship_type,
        country_of_origin: data.identity?.country_of_origin,
        nationality_type: data.identity?.nationality_type,
        nationality: data.identity?.nationality,
        [field]: value
      }
    });
  };

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md" c="blue">
          📋 Información Principal
        </Title>
        
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Número de Registro Penitenciario"
              placeholder="Ej: REG-2024-001"
              value={data.registration_number || ''}
              onChange={(e) => handleMainDataChange('registration_number', e.target.value)}
              required
              error={errors.registration_number}
              description="Número único de registro en el sistema penitenciario"
            />
            <DatePickerInput
              label="Fecha de Ingreso"
              placeholder="Seleccione la fecha"
              value={data.admission_date || null}
              onChange={(date) => handleMainDataChange('admission_date', date)}
              required
              error={errors.admission_date}
              maxDate={new Date()}
            />
          </Group>

          <TextInput
            label="Número de Expediente Fiscal"
            placeholder="Ej: EXP-2024-FISCAL-001"
            value={data.fiscal_file_number || ''}
            onChange={(e) => handleMainDataChange('fiscal_file_number', e.target.value)}
            required
            error={errors.fiscal_file_number}
            description="Número del archivo fiscal o expediente principal"
          />
        </Stack>
      </Card>

      {/* 🆔 INFORMACIÓN DE IDENTIDAD */}
      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md" c="green">
          🆔 Información de Identidad
        </Title>
        
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Apellidos"
              placeholder="Ingrese los apellidos"
              value={data.identity?.surname || ''}
              onChange={(e) => handleIdentityChange('surname', e.target.value)}
              required
              error={errors['identity.surname']}
            />
            <TextInput
              label="Nombres"
              placeholder="Ingrese los nombres"
              value={data.identity?.first_name || ''}
              onChange={(e) => handleIdentityChange('first_name', e.target.value)}
              required
              error={errors['identity.first_name']}
            />
          </Group>

          <Group grow>
            <DatePickerInput
              label="Fecha de Nacimiento"
              placeholder="Seleccione la fecha"
              value={data.identity?.birth_date || null}
              onChange={(date) => handleIdentityChange('birth_date', date)}
              maxDate={new Date()}
              error={errors['identity.birth_date']}
            />
            <TextInput
              label="Lugar de Nacimiento"
              placeholder="Ciudad, Departamento"
              value={data.identity?.birth_place || ''}
              onChange={(e) => handleIdentityChange('birth_place', e.target.value)}
              error={errors['identity.birth_place']}
            />
          </Group>

          <Textarea
            label="Domicilio/Residencia"
            placeholder="Dirección completa de residencia"
            value={data.identity?.residence || ''}
            onChange={(e) => handleIdentityChange('residence', e.target.value)}
            minRows={2}
            error={errors['identity.residence']}
          />

          <Group grow>
            <Select
              label="Tipo de Ciudadanía"
              placeholder="Seleccione el tipo"
              value={data.identity?.citizenship_type || ''}
              onChange={(value) => handleIdentityChange('citizenship_type', value)}
              data={[
                { value: 'Local', label: 'Local' },
                { value: 'Ciudadano Nacional', label: 'Ciudadano Nacional' },
                { value: 'Ciudadano Extranjero', label: 'Ciudadano Extranjero' }
              ]}
              error={errors['identity.citizenship_type']}
            />
            <TextInput
              label="País de Origen"
              placeholder="Ej: Bolivia"
              value={data.identity?.country_of_origin || ''}
              onChange={(e) => handleIdentityChange('country_of_origin', e.target.value)}
              error={errors['identity.country_of_origin']}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Nacionalidad"
              placeholder="Ej: Boliviana"
              value={data.identity?.nationality || ''}
              onChange={(e) => handleIdentityChange('nationality', e.target.value)}
              error={errors['identity.nationality']}
            />
            <TextInput
              label="Tipo de Nacionalidad"
              placeholder="Por nacimiento, naturalización, etc."
              value={data.identity?.nationality_type || ''}
              onChange={(e) => handleIdentityChange('nationality_type', e.target.value)}
              error={errors['identity.nationality_type']}
              description="Por nacimiento, naturalización, etc."
            />
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};