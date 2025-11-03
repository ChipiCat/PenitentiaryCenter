import React, { useState } from 'react';
import { Card, Stack, Group, Button, Select, Title } from '@mantine/core';
import { UserSquare } from 'lucide-react';
import type { CompletePrisonerProfile } from '../../../../../shared/types';
import type { UpdatePersonalData } from '../../../../../shared/types/personalTypes';
import { OptimizedTextInput } from '../../forms/OptimizedInput';

interface PersonalInfoEditFormProps {
  profile: CompletePrisonerProfile;
  onSave: (personalData: Partial<UpdatePersonalData>) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
  errors?: {
    personal?: Record<string, string>;
  };
}

export const PersonalInfoEditForm: React.FC<PersonalInfoEditFormProps> = ({
  profile,
  onSave,
  onCancel,
  isLoading,
  errors = {},
}) => {
  // ==================== ESTADO DEL FORMULARIO ====================
  const [personalData, setPersonalData] = useState<Partial<UpdatePersonalData>>({
    gender: profile.personal?.gender ?? '',
    father_name: profile.personal?.father_name ?? '',
    mother_name: profile.personal?.mother_name ?? '',
    marital_status: profile.personal?.marital_status ?? '',
    education_level: profile.personal?.education_level ?? '',
    occupation: profile.personal?.occupation ?? '',
    languages: profile.personal?.languages ?? '',
    id_document_type: (profile.personal?.id_document_type as "CedulaDeIdentidad" | "Pasaporte" | "Otro") ?? 'CedulaDeIdentidad',
    id_document_number: profile.personal?.id_document_number ?? '',
  });

  // ==================== MANEJADORES ====================
  const handleChange = (field: keyof UpdatePersonalData, value: string) => {
    setPersonalData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSave(personalData);
  };

  // ==================== RENDERIZADO ====================
  return (
    <Stack gap="md">
      <Card withBorder padding="lg" className="relative">
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <UserSquare size={20} />
            <Title order={4} size="h5">
              Editar Información Personal
            </Title>
          </Group>
        </Group>

        <Stack gap="md">
          {/* Primera Fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Estado Civil"
              placeholder="Seleccione el estado civil"
              value={personalData.marital_status}
              onChange={(value) => handleChange('marital_status', value ?? '')}
              data={[
                { value: 'Soltero', label: 'Soltero' },
                { value: 'Casado', label: 'Casado' },
                { value: 'Viudo', label: 'Viudo' },
                { value: 'Divorciado', label: 'Divorciado' },
              ]}
              required
              error={errors.personal?.marital_status}
            />

            <OptimizedTextInput
              label="Nivel de Educación"
              placeholder="Ej: Primaria, Secundaria, Universidad"
              value={personalData.education_level ?? ''}
              onChange={(value: string) => handleChange('education_level', value)}
              required
              error={errors.personal?.education_level}
            />
          </div>

          {/* Segunda Fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Género"
              placeholder="Seleccione el género"
              value={personalData.gender}
              onChange={(value) => handleChange('gender', value ?? '')}
              data={[
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Femenino', label: 'Femenino' },
                { value: 'Otro', label: 'Otro' },
              ]}
              required
              error={errors.personal?.gender}
            />

            <OptimizedTextInput
              label="Ocupación"
              placeholder="Ej: Estudiante, Comerciante"
              value={personalData.occupation ?? ''}
              onChange={(value: string) => handleChange('occupation', value)}
              required
              error={errors.personal?.occupation}
            />
          </div>

          {/* Tercera Fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OptimizedTextInput
              label="Nombre del Padre"
              placeholder="Nombre completo del padre"
              value={personalData.father_name ?? ''}
              onChange={(value: string) => handleChange('father_name', value)}
              required
              error={errors.personal?.father_name}
            />

            <OptimizedTextInput
              label="Nombre de la Madre"
              placeholder="Nombre completo de la madre"
              value={personalData.mother_name ?? ''}
              onChange={(value: string) => handleChange('mother_name', value)}
              required
              error={errors.personal?.mother_name}
            />
          </div>

          {/* Cuarta Fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Documento de Identidad"
              placeholder="Seleccione el tipo"
              value={personalData.id_document_type}
              onChange={(value) => handleChange('id_document_type', value ?? 'CedulaDeIdentidad')}
              data={[
                { value: 'CedulaDeIdentidad', label: 'Cédula de Identidad' },
                { value: 'Pasaporte', label: 'Pasaporte' },
                { value: 'Otro', label: 'Otro' },
              ]}
              required
              error={errors.personal?.id_document_type}
            />

            <OptimizedTextInput
              label="Número de Documento de Identidad"
              placeholder="Ej: 12312323"
              value={personalData.id_document_number ?? ''}
              onChange={(value: string) => handleChange('id_document_number', value)}
              required
              error={errors.personal?.id_document_number}
            />
          </div>

          {/* Idiomas */}
          <OptimizedTextInput
            label="Idiomas"
            placeholder="Ej: Español, Aymara, Quechua"
            value={personalData.languages ?? ''}
            onChange={(value: string) => handleChange('languages', value)}
            required
            error={errors.personal?.languages}
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
