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
import type { 
  CreatePrisonerData,
  MaritalStatus,
  EducationLevel
} from '../../../../shared/types';

interface PersonalData {
  gender?: string;
  marital_status?: MaritalStatus;
  id_document_type?: string;
  id_document_number?: string;
  education_level?: EducationLevel;
  occupation?: string;
  languages?: string;
  father_name?: string;
  mother_name?: string;
}

interface PersonalInfoStepProps {
  data: Partial<CreatePrisonerData> & { personal?: Partial<PersonalData> };
  onUpdate: (updates: Partial<CreatePrisonerData> & { personal?: Partial<PersonalData> }) => void;
  errors?: Record<string, string>;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ 
  data, 
  onUpdate, 
  errors = {} 
}) => {
  // Handler para datos personales
  const handlePersonalChange = (field: string, value: any) => {
    onUpdate({
      personal: {
        ...data.personal,
        [field]: value
      }
    });
  };

  return (
    <Stack gap="lg">
      {/* 👤 INFORMACIÓN PERSONAL */}
      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md" c="purple">
          👤 Información Personal
        </Title>
        
        <Stack gap="md">
          <Group grow>
            <Select
              label="Género"
              placeholder="Seleccione el género"
              value={data.personal?.gender || ''}
              onChange={(value) => handlePersonalChange('gender', value)}
              data={[
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Femenino', label: 'Femenino' },
                { value: 'Otro', label: 'Otro' }
              ]}
              error={errors['personal.gender']}
            />
            <Select
              label="Estado Civil"
              placeholder="Seleccione el estado civil"
              value={data.personal?.marital_status || ''}
              onChange={(value) => handlePersonalChange('marital_status', value as MaritalStatus)}
              data={[
                { value: 'Soltero', label: 'Soltero/a' },
                { value: 'Casado', label: 'Casado/a' },
                { value: 'Viudo', label: 'Viudo/a' },
                { value: 'Divorciado', label: 'Divorciado/a' },
                { value: 'Unión Libre', label: 'Unión Libre' }
              ]}
              error={errors['personal.marital_status']}
            />
          </Group>

          <Group grow>
            <Select
              label="Tipo de Documento"
              placeholder="Seleccione el tipo"
              value={data.personal?.id_document_type || ''}
              onChange={(value) => handlePersonalChange('id_document_type', value)}
              data={[
                { value: 'Cédula de identidad', label: 'Cédula de Identidad' },
                { value: 'Pasaporte', label: 'Pasaporte' },
                { value: 'Otro', label: 'Otro' }
              ]}
              error={errors['personal.id_document_type']}
            />
            <TextInput
              label="Número de Documento"
              placeholder="Número de cédula, pasaporte, etc."
              value={data.personal?.id_document_number || ''}
              onChange={(e) => handlePersonalChange('id_document_number', e.target.value)}
              error={errors['personal.id_document_number']}
            />
          </Group>

          <Group grow>
            <Select
              label="Nivel de Educación"
              placeholder="Seleccione el nivel"
              value={data.personal?.education_level || ''}
              onChange={(value) => handlePersonalChange('education_level', value as EducationLevel)}
              data={[
                { value: 'Sin Educación', label: 'Sin Educación' },
                { value: 'Primaria Incompleta', label: 'Primaria Incompleta' },
                { value: 'Primaria Completa', label: 'Primaria Completa' },
                { value: 'Secundaria Incompleta', label: 'Secundaria Incompleta' },
                { value: 'Secundaria Completa', label: 'Secundaria Completa' },
                { value: 'Técnico', label: 'Técnico' },
                { value: 'Universitario Incompleto', label: 'Universitario Incompleto' },
                { value: 'Universitario Completo', label: 'Universitario Completo' },
                { value: 'Postgrado', label: 'Postgrado' }
              ]}
              error={errors['personal.education_level']}
            />
            <TextInput
              label="Ocupación"
              placeholder="Profesión u oficio"
              value={data.personal?.occupation || ''}
              onChange={(e) => handlePersonalChange('occupation', e.target.value)}
              error={errors['personal.occupation']}
            />
          </Group>

          <Textarea
            label="Idiomas que Habla"
            placeholder="Ej: Español, Quechua, Aymara"
            value={data.personal?.languages || ''}
            onChange={(e) => handlePersonalChange('languages', e.target.value)}
            minRows={2}
            error={errors['personal.languages']}
          />
        </Stack>
      </Card>

      {/* 👨‍👩‍👧‍👦 INFORMACIÓN FAMILIAR */}
      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md" c="teal">
          👨‍👩‍👧‍👦 Información Familiar
        </Title>
        
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Nombre del Padre"
              placeholder="Nombre completo del padre"
              value={data.personal?.father_name || ''}
              onChange={(e) => handlePersonalChange('father_name', e.target.value)}
              error={errors['personal.father_name']}
            />
            <TextInput
              label="Nombre de la Madre"
              placeholder="Nombre completo de la madre"
              value={data.personal?.mother_name || ''}
              onChange={(e) => handlePersonalChange('mother_name', e.target.value)}
              error={errors['personal.mother_name']}
            />
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};