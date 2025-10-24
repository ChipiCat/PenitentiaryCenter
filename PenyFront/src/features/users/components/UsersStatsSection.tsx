import { Grid } from '@mantine/core';
import type { UserStat } from '../../../shared/types/users/userTypes';
import { UserStatCard } from './UserStatCard';

interface UsersStatsSectionProps {
  stats: UserStat[];
}

export const UsersStatsSection = ({ stats }: UsersStatsSectionProps) => {
  return (
    <Grid>
      {stats.map((stat, index) => (
        <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
          <UserStatCard stat={stat} />
        </Grid.Col>
      ))}
    </Grid>
  );
};