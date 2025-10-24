import { Container, Title, Text, Group, Stack } from '@mantine/core';
import { SystemActivityStats } from './components/SystemActivityStats';
import { SystemActivityFilters } from './components/SystemActivityFilters';
import { SystemActivityList } from './components/SystemActivityList';
import { useSystemActivity } from './hooks/useSystemActivity';
import type { ActivityUser } from '../../shared/types/commonTypes';
import type { PeriodType } from '../../shared/types/commonTypes';

const ActivityPage = () => {
  const {
    actionFilter,
    setActionFilter,
    timeFilter,
    setTimeFilter,
    searchTerm,
    setSearchTerm,
    filteredActivities
  } = useSystemActivity();

  const handleUserClick = (user: ActivityUser) => {
    // Lógica para manejar click en usuario
    console.log('User clicked:', user);
  };

  const handleTargetClick = (target: string) => {
    // Lógica para manejar click en objetivo
    console.log('Target clicked:', target);
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Group justify="space-between" mb="xs">
            <div>
              <Title order={2}>Actividad Global del Sistema</Title>
              <Text c="dimmed" size="sm">
                Monitoreo completo de todas las acciones realizadas por los usuarios
              </Text>
            </div>
            <SystemActivityFilters
              actionFilter={actionFilter}
              onActionFilterChange={setActionFilter}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              showSearch={true}
            />
          </Group>
        </div>

        <SystemActivityStats period={timeFilter as PeriodType} />

        <SystemActivityList
          activities={filteredActivities}
          onUserClick={handleUserClick}
          onTargetClick={handleTargetClick}
        />
      </Stack>
    </Container>
  );
};

export default ActivityPage;