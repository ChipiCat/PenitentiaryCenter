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
} from '../../../../shared/types/prisoners';

interface PersonalInfoStepProps {
  data: Partial<CreatePrisonerData>;
  onUpdate: (updates: Partial<CreatePrisonerData>) => void;
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
              onChange={(value) => handlePersonalChange('marital_status', value)}
              data={[
                { value: 'Soltero', label: 'Soltero/a' },
                { value: 'Casado', label: 'Casado/a' },
                { value: 'Viudo', label: 'Viudo/a' },
                { value: 'Divorciado', label: 'Divorciado/a' }
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
            <TextInput
              label="Nivel de Educación"
              placeholder="Ej: Primaria, Secundaria, Universitaria"
              value={data.personal?.education_level || ''}
              onChange={(e) => handlePersonalChange('education_level', e.target.value)}
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