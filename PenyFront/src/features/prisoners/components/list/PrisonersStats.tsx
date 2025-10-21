import React from 'react';
import { Group, Card, Text, Badge } from '@mantine/core';

interface Statistics {
  total: number;
  activos: number;
  preventivos: number;
  condenados: number;
}

interface PrisonersStatsProps {
  statistics: Statistics;
}

export const PrisonersStats: React.FC<PrisonersStatsProps> = ({ statistics }) => {
  return (
    <Group grow>
      <Card withBorder padding="md">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">
              Total Prisioneros
            </Text>
            <Text size="xl" fw={700} c="blue">
              {statistics.total}
            </Text>
          </div>
          <Badge color="blue" variant="light">
            Activo
          </Badge>
        </Group>
      </Card>

      <Card withBorder padding="md">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">
              Preventivos
            </Text>
            <Text size="xl" fw={700} c="orange">
              {statistics.preventivos}
            </Text>
          </div>
          <Badge color="orange" variant="light">
            Preventivo
          </Badge>
        </Group>
      </Card>

      <Card withBorder padding="md">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">
              Condenados
            </Text>
            <Text size="xl" fw={700} c="red">
              {statistics.condenados}
            </Text>
          </div>
          <Badge color="red" variant="light">
            Condenado
          </Badge>
        </Group>
      </Card>
    </Group>
  );
};