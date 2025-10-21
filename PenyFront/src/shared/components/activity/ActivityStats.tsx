import React from 'react';
import { Grid, Card, Text } from '@mantine/core';

export interface ActivityStat {
  key: string;
  label: string;
  value: number;
  color: string;
}

export interface ActivityStatsProps {
  stats: ActivityStat[];
  columns?: { base?: number; sm?: number; md?: number; lg?: number };
}

export const ActivityStats: React.FC<ActivityStatsProps> = ({
  stats,
  columns = { base: 12, sm: 6, md: 3 }
}) => {
  return (
    <Grid>
      {stats.map((stat) => (
        <Grid.Col key={stat.key} span={columns}>
          <Card withBorder padding="md" ta="center">
            <Text size="xl" fw={700} c={stat.color}>
              {stat.value}
            </Text>
            <Text size="sm" c="dimmed">{stat.label}</Text>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
};