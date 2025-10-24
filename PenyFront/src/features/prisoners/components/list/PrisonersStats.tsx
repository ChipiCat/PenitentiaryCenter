import React from 'react';
import { Group, Card, Text, Badge } from '@mantine/core';

interface Statistics {
  total: number;
  activos: number;
  trasladados: number;
  liberados: number;
  archivados: number;
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
            Total
          </Badge>
        </Group>
      </Card>

      <Card withBorder padding="md">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">
              Activos
            </Text>
            <Text size="xl" fw={700} c="green">
              {statistics.activos}
            </Text>
          </div>
          <Badge color="green" variant="light">
            Activo
          </Badge>
        </Group>
      </Card>

      <Card withBorder padding="md">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">
              Trasladados
            </Text>
            <Text size="xl" fw={700} c="orange">
              {statistics.trasladados}
            </Text>
          </div>
          <Badge color="orange" variant="light">
            Trasladado
          </Badge>
        </Group>
      </Card>

      <Card withBorder padding="md">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">
              Liberados
            </Text>
            <Text size="xl" fw={700} c="teal">
              {statistics.liberados}
            </Text>
          </div>
          <Badge color="teal" variant="light">
            Liberado
          </Badge>
        </Group>
      </Card>

      <Card withBorder padding="md">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">
              Archivados
            </Text>
            <Text size="xl" fw={700} c="gray">
              {statistics.archivados}
            </Text>
          </div>
          <Badge color="gray" variant="light">
            Archivado
          </Badge>
        </Group>
      </Card>
    </Group>
  );
};
