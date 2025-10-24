import React from 'react';
import { Paper, Group, Text } from '@mantine/core';

export interface StatCardData {
  title: string;
  value: number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}

export interface StatsCardProps {
  stat: StatCardData;
  size?: 'sm' | 'md' | 'lg';
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  stat, 
  size = 'md' 
}) => {
  const getSizes = () => {
    switch (size) {
      case 'sm':
        return { padding: 'sm', valueSize: 'lg', iconSize: 6 };
      case 'lg':
        return { padding: 'lg', valueSize: '2xl', iconSize: 10 };
      default:
        return { padding: 'md', valueSize: 'xl', iconSize: 8 };
    }
  };

  const { padding, valueSize, iconSize } = getSizes();

  return (
    <Paper p={padding} withBorder>
      <Group justify="space-between" mb="xs">
        <div>
          <Text size="xs" c="dimmed" fw={500}>
            {stat.title}
          </Text>
          <Text size={valueSize} fw={700}>
            {stat.value}
          </Text>
        </div>
        <div
          style={{
            backgroundColor: `var(--mantine-color-${stat.color}-1)`,
            color: `var(--mantine-color-${stat.color}-6)`,
            padding: iconSize,
            borderRadius: '8px'
          }}
        >
          {stat.icon}
        </div>
      </Group>
      <Text size="xs" c={stat.color}>
        {stat.subtitle}
      </Text>
    </Paper>
  );
};