import { Paper, Group, Text } from '@mantine/core';
import type { UserStat } from '../../../shared/types/users/userTypes';

interface UserStatCardProps {
  stat: UserStat;
}

export const UserStatCard = ({ stat }: UserStatCardProps) => {
  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="xs">
        <div>
          <Text size="xs" c="dimmed" fw={500}>
            {stat.title}
          </Text>
          <Text size="xl" fw={700}>
            {stat.value}
          </Text>
        </div>
        <div
          style={{
            backgroundColor: `var(--mantine-color-${stat.color}-1)`,
            color: `var(--mantine-color-${stat.color}-6)`,
            padding: '8px',
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