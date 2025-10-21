import { Container, Title, Text, Group, Stack } from '@mantine/core';
import { SystemActivityStats } from './components/SystemActivityStats';
import { SystemActivityFilters } from './components/SystemActivityFilters';
import { SystemActivityList } from './components/SystemActivityList';
import { useSystemActivity } from './hooks/useSystemActivity';

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

  const handleUserClick = (user: any) => {
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

        {/* Estadísticas */}
        <SystemActivityStats period={timeFilter as any} />

        {/* Lista de Actividades */}
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