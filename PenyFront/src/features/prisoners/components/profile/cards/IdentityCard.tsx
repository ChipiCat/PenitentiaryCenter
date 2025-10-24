import React from 'react';
import { Card, Group, Title, ThemeIcon, Stack, Text, Badge, Alert } from '@mantine/core';
import { User } from 'lucide-react';
import type { Identity } from '../../../../../shared/types';

interface IdentityCardProps {
  identity?: Identity;
}

export const IdentityCard: React.FC<IdentityCardProps> = ({ identity }) => {
  return (
    <Card withBorder padding="lg" h="100%">
      <Group mb="md">
        <ThemeIcon variant="light" color="teal">
          <User size={20} />
        </ThemeIcon>
        <Title order={3} size="h4">Identidad</Title>
      </Group>
      
      {identity ? (
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Nombre Completo</Text>
            <Text fw={500}>{identity.first_name} {identity.surname}</Text>
          </Group>
          
          {identity.birth_date && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Fecha de Nacimiento</Text>
              <Text fw={500}>
                {new Date(identity.birth_date).toLocaleDateString('es-ES')}
              </Text>
            </Group>
          )}
          
          {identity.birth_place && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Lugar de Nacimiento</Text>
              <Text fw={500}>{identity.birth_place}</Text>
            </Group>
          )}
          
          {identity.nationality && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Nacionalidad</Text>
              <Text fw={500}>{identity.nationality}</Text>
            </Group>
          )}
          
          {identity.citizenship_type && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Tipo de Ciudadanía</Text>
              <Badge variant="outline" size="sm">
                {identity.citizenship_type}
              </Badge>
            </Group>
          )}
        </Stack>
      ) : (
        <Alert color="yellow" variant="light">
          <Text size="sm">No hay información de identidad registrada</Text>
        </Alert>
      )}
    </Card>
  );
};