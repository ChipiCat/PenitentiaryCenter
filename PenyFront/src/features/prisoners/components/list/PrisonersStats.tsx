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
         <div className=" flex flex-col justify-between gap-1">
          
            <Text size="sm" c="dimmed">
              Total 
            </Text>
            <Text size="xl" fw={700} c="blue">
              {statistics.total}
            </Text>
          
          <Badge color="blue" variant="light">
            Total
          </Badge>
        </div>
      </Card>

      <Card withBorder padding="md">
        <div className=" flex flex-col justify-between gap-1">
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
        </div>
      </Card>

      <Card withBorder padding="md">
        <div className=" flex flex-col justify-between gap-1">
          <Text size="sm" c="dimmed">
            Trasladados
          </Text>
          <Text size="xl" fw={700} c="orange">
            {statistics.trasladados}
          </Text>

          <Badge color="orange" variant="light">
            Trasladado
          </Badge>
        </div>
      </Card>

      <Card withBorder padding="md">
         <div className=" flex flex-col justify-between gap-1">
          <Text size="sm" c="dimmed">
            Liberados
          </Text>
          <Text size="xl" fw={700} c="teal">
              {statistics.liberados}
            </Text>
          
          <Badge color="teal" variant="light">
            Liberado
          </Badge>
        </div>
      </Card>

      <Card withBorder padding="md">
        <div className=" flex flex-col justify-between gap-1">
          
            <Text size="sm" c="dimmed">
              Archivados
            </Text>
            <Text size="xl" fw={700} c="gray">
              {statistics.archivados}
            </Text>
          
          <Badge color="gray" variant="light">
            Archivado
          </Badge>
        </div>
      </Card>
    </Group>
  );
};
