import { Container, Grid, Stack } from '@mantine/core';
import { PersonalInfoCard, UsageStatsCard, RecentActivityCard } from './components';

const ProfilePage = () => {
  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container size="xl" py="md">
        <Grid>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <PersonalInfoCard />
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Stack gap="md">
              <UsageStatsCard />
              <RecentActivityCard />
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
};

export default ProfilePage;