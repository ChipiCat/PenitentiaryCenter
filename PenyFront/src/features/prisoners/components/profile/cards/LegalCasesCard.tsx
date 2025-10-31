import React from 'react';
import { Card, Group, Title, ThemeIcon, Stack, Text, Badge, Divider } from '@mantine/core';
import { Gavel } from 'lucide-react';
import type { Case, Mandate } from '../../../../../shared/types/caseTypes';

interface LegalCasesCardProps {
  cases: Case[];
  mandates: Mandate[];
}

export const LegalCasesCard: React.FC<LegalCasesCardProps> = ({ cases, mandates }) => {
  return (
    <Card withBorder padding="lg" h="100%">
      <Group mb="md" gap={6}>
        <ThemeIcon variant="transparent" color="#20263c">
          <Gavel size={20} />
        </ThemeIcon>
        <Title order={3} size="h4">Casos Judiciales</Title>
      </Group>
      <Divider mb="md" />
      <Stack gap="md">
        {cases.length > 0 ? cases.map((c) => (
          <Card key={c.id} withBorder padding="md" mb="sm">
            <Group justify="space-between" mb="xs">
              <Text fw={600}>Caso: {c.case_number}</Text>
              <Badge color={c.status === 'EnProceso' ? 'green' : 'gray'}>{c.status}</Badge>
            </Group>
            <Text size="sm" c="dimmed">Delito/Crimen: <b>{c.crime}</b></Text>
            <Text size="sm">Juzgado: {c.court_name}</Text>
            <Text size="sm">Juez: {c.judge_name}</Text>
            <Text size="sm">Años de Sentencia: {c.sentence_years}</Text>
            <Text size="sm">Fecha de Inicio: {new Date(c.start_date).toLocaleDateString('es-ES')}</Text>
            {c.end_date && <Text size="sm">Fecha de Fin: {new Date(c.end_date).toLocaleDateString('es-ES')}</Text>}
            {c.remarks && <Text size="sm" c="dimmed">Observaciones: {c.remarks}</Text>}
          </Card>
        )) : (
          <Text size="sm" c="dimmed">No hay casos judiciales registrados.</Text>
        )}
      </Stack>
      <Divider my="md" />
      <Title order={4} size="h5" mb="sm">Mandatos Judiciales</Title>
      <Stack gap="md">
        {mandates.length > 0 ? mandates.map((m) => (
          <Card key={m.id} withBorder padding="md" mb="sm">
            <Group justify="space-between" mb="xs">
              <Text fw={600}>Mandato: {m.type}</Text>
              <Badge color={m.status === 'Vigente' ? 'green' : 'gray'}>{m.status}</Badge>
            </Group>
            <Text size="sm">Fecha de Emisión: {new Date(m.createdAt).toLocaleDateString('es-ES')}</Text>
            {m.description && <Text size="sm" c="dimmed">Descripción: {m.description}</Text>}
            {m.file && (
              <Text size="sm">
                <a href={m.file_id} target="_blank" rel="noopener noreferrer">Ver archivo adjunto</a>
              </Text>
            )}
          </Card>
        )) : (
          <Text size="sm" c="dimmed">No hay mandatos judiciales registrados.</Text>
        )}
      </Stack>
    </Card>
  );
};
