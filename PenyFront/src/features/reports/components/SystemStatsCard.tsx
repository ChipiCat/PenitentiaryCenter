import { Paper, Group, Text, ThemeIcon } from '@mantine/core';
import type { SystemStat } from '../types/reportTypes';

interface SystemStatsCardProps {
  stat: SystemStat;
}

export const SystemStatsCard = ({ stat }: SystemStatsCardProps) => {
  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size="sm" fw={500}>
            {stat.title}
          </Text>
          <Text size="xl" fw={700}>
            {stat.value}
          </Text>
          <Text 
            size="xs" 
            c={stat.changeType === 'positive' ? 'teal' : 'red'}
            fw={500}
          >
            {stat.change}
          </Text>
        </div>
        <ThemeIcon 
          color={stat.color} 
          variant="light" 
          radius="md" 
          size="lg"
        >
          <stat.icon size={20} />
        </ThemeIcon>
      </Group>
    </Paper>
  );
};