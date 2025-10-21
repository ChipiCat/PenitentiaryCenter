import React from 'react';
import { Card, Group, Title, ThemeIcon, Stack, Text } from '@mantine/core';
import { FileText, Calendar, Clock } from 'lucide-react';
import type { PrisonerBase } from '../../../../../shared/services/prisonersApi';

interface BasicInfoCardProps {
  prisoner: PrisonerBase;
}

export const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ prisoner }) => {
  return (
    <Card withBorder padding="lg" h="100%">
      <Group mb="md">
        <ThemeIcon variant="light" color="blue">
          <FileText size={20} />
        </ThemeIcon>
        <Title order={3} size="h4">Información Principal</Title>
      </Group>
      
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">Número de Registro</Text>
          <Text fw={500}>{prisoner.registration_number}</Text>
        </Group>
        
        <Group justify="space-between">
          <Text size="sm" c="dimmed">Fecha de Ingreso</Text>
          <Group gap={4}>
            <Calendar size={14} />
            <Text fw={500}>
              {new Date(prisoner.admission_date).toLocaleDateString('es-ES')}
            </Text>
          </Group>
        </Group>
        
        {prisoner.fiscal_file_number && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Expediente Fiscal</Text>
            <Text fw={500}>{prisoner.fiscal_file_number}</Text>
          </Group>
        )}
        
        <Group justify="space-between">
          <Text size="sm" c="dimmed">Registrado el</Text>
          <Group gap={4}>
            <Clock size={14} />
            <Text size="sm">
              {new Date(prisoner.created_at).toLocaleDateString('es-ES')}
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};