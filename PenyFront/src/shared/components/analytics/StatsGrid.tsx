import React from 'react';
import { Grid } from '@mantine/core';
import { StatsCard, type StatCardData } from './MetricCard';

export interface StatsGridProps {
  stats: StatCardData[];
  columns?: { base?: number; sm?: number; md?: number; lg?: number };
  cardSize?: 'sm' | 'md' | 'lg';
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = { base: 12, sm: 6, lg: 3 },
  cardSize = 'md'
}) => {
  return (
    <Grid>
      {stats.map((stat, index) => (
        <Grid.Col key={index} span={columns}>
          <StatsCard stat={stat} size={cardSize} />
        </Grid.Col>
      ))}
    </Grid>
  );
};