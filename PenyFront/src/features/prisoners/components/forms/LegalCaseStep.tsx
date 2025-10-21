import React from 'react';
import { 
  TextInput, 
  Group, 
  Stack, 
  Title,
  Card,
  Text
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { CreatePrisonerData } from '../../../../shared/types';

interface InitialCase {
  case_number?: string;
  crime?: string;
  court_name?: string;
  judge_name?: string;
  start_date?: Date;
}

interface LegalCaseStepProps {
  data: Partial<CreatePrisonerData> & { initialCase?: InitialCase };
  onUpdate: (updates: Partial<CreatePrisonerData> & { initialCase?: Partial<InitialCase> }) => void;
  errors?: Record<string, string>;
}

export const LegalCaseStep: React.FC<LegalCaseStepProps> = ({ 
  data, 
  onUpdate, 
  errors = {} 
}) => {
  const handleInitialCaseChange = (field: string, value: any) => {
    onUpdate({
      initialCase: {
        ...data.initialCase,
        [field]: value
      }
    });
  };

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md" c="red">
          ⚖️ Caso Judicial Principal
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Información del caso judicial principal que motivó el ingreso al centro penitenciario
        </Text>
        
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Número de Caso"
              placeholder="Ej: CASO-2024-001"
              value={data.initialCase?.case_number || ''}
              onChange={(e) => handleInitialCaseChange('case_number', e.target.value)}
              required
              error={errors['initialCase.case_number']}
              description="Número único del expediente judicial"
            />
            <DatePickerInput
              label="Fecha de Inicio"
              placeholder="Fecha del caso"
              value={data.initialCase?.start_date || null}
              onChange={(date) => handleInitialCaseChange('start_date', date)}
              error={errors['initialCase.start_date']}
              maxDate={new Date()}
            />
          </Group>


          <TextInput
            label="Delito/Causa Penal"
            placeholder="Descripción del delito o causa"
            value={data.initialCase?.crime || ''}
            onChange={(e) => handleInitialCaseChange('crime', e.target.value)}
            required
            error={errors['initialCase.crime']}
            description="Descripción del delito por el cual fue procesado"
          />

          <Group grow>
            <TextInput
              label="Nombre del Juzgado/Tribunal"
              placeholder="Ej: Tribunal de Sentencia Penal"
              value={data.initialCase?.court_name || ''}
              onChange={(e) => handleInitialCaseChange('court_name', e.target.value)}
              error={errors['initialCase.court_name']}
            />
            <TextInput
              label="Nombre del Juez"
              placeholder="Nombre del juez a cargo"
              value={data.initialCase?.judge_name || ''}
              onChange={(e) => handleInitialCaseChange('judge_name', e.target.value)}
              error={errors['initialCase.judge_name']}
            />
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};
