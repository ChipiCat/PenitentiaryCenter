import React from 'react';
import { Card, Group, Title, ThemeIcon, Stack, Text, Badge, Alert } from '@mantine/core';
import { Building, MapPin } from 'lucide-react';
import type { Penitentiary } from '../../../../../shared/services/prisonersApi';

interface PenitentiaryCardProps {
  penitentiary?: Penitentiary;
}

export const PenitentiaryCard: React.FC<PenitentiaryCardProps> = ({ penitentiary }) => {
  return (
    <Card withBorder padding="lg" h="100%">
      <Group mb="md">
        <ThemeIcon variant="light" color="indigo">
          <Building size={20} />
        </ThemeIcon>
        <Title order={3} size="h4">Ubicación Penitenciaria</Title>
      </Group>
      
      {penitentiary ? (
        <Stack gap="md">
          {penitentiary.category && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Categoría</Text>
              <Badge 
                variant="light" 
                color={penitentiary.category === 'Derecho Común' ? 'blue' :
                       penitentiary.category === 'Prisión Preventiva' ? 'orange' : 'red'}
              >
                {penitentiary.category}
              </Badge>
            </Group>
          )}
          
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Ubicación</Text>
            <Group gap={4}>
              <MapPin size={14} />
              <Text fw={500}>
                {[
                  penitentiary.building_number && `Edificio ${penitentiary.building_number}`,
                  penitentiary.cell_number && `Celda ${penitentiary.cell_number}`,
                  penitentiary.bed_number && `Cama ${penitentiary.bed_number}`
                ].filter(Boolean).join(', ') || 'No asignada'}
              </Text>
            </Group>
          </Group>
        </Stack>
      ) : (
        <Alert color="yellow" variant="light">
          <Text size="sm">No hay información penitenciaria registrada</Text>
        </Alert>
      )}
    </Card>
  );
};