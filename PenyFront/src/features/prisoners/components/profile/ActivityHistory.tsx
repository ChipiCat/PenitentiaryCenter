import { 
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Badge,
  Grid,
  Timeline,
  Select,
  TextInput
} from '@mantine/core';
import { 
  Activity,
  Search,
  Filter,
  User,
  AlertTriangle,
  Clock,
  BookOpen
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface ActivityHistoryProps {
  prisonerId: string;
}

export const ActivityHistory = ({ prisonerId }: ActivityHistoryProps) => {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 🔧 Mock data que simula ser específico del prisionero
  const allActivities = useMemo(() => [
    {
      id: 1,
      prisonerId, // 🆕 Usar el prisonerId
      type: 'medical',
      title: 'Consulta médica rutinaria',
      description: 'Chequeo médico mensual realizado por Dr. García',
      date: '2024-01-20',
      time: '10:30',
      status: 'completed',
      priority: 'normal'
    },
    {
      id: 2,
      prisonerId, // 🆕 Usar el prisonerId
      type: 'legal',
      title: 'Visita del abogado',
      description: 'Reunión con Dr. Hernández para revisar el caso',
      date: '2024-01-18',
      time: '14:00',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 3,
      prisonerId, // 🆕 Usar el prisonerId
      type: 'education',
      title: 'Clase de alfabetización',
      description: 'Participación en programa educativo',
      date: '2024-01-17',
      time: '09:00',
      status: 'completed',
      priority: 'normal'
    },
    {
      id: 4,
      prisonerId, // 🆕 Usar el prisonerId
      type: 'incident',
      title: 'Reporte de incidente menor',
      description: 'Altercado verbal con otro interno',
      date: '2024-01-15',
      time: '16:45',
      status: 'warning',
      priority: 'medium'
    },
    {
      id: 5,
      prisonerId, // 🆕 Usar el prisonerId
      type: 'visit',
      title: 'Visita familiar',
      description: 'Visita de María Pérez (madre)',
      date: '2024-01-14',
      time: '15:00',
      status: 'completed',
      priority: 'normal'
    }
  ], [prisonerId]); // 🆕 Dependencia del prisonerId

  // 🔧 Filtrar actividades específicas del prisionero
  const activities = useMemo(() => 
    allActivities.filter(activity => activity.prisonerId === prisonerId),
    [allActivities, prisonerId]
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Activity size={14} />;
      case 'legal': return <BookOpen size={14} />;
      case 'education': return <BookOpen size={14} />;
      case 'incident': return <AlertTriangle size={14} />;
      case 'visit': return <User size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getActivityColor = (type: string, status?: string) => {
    if (status === 'warning') return 'red';
    switch (type) {
      case 'medical': return 'blue';
      case 'legal': return 'purple';
      case 'education': return 'green';
      case 'incident': return 'red';
      case 'visit': return 'orange';
      default: return 'gray';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesType = !filterType || activity.type === filterType;
    const matchesSearch = !searchTerm || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  return (
    <Stack gap="lg">
      {/* Filtros */}
      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <ThemeIcon size="sm" variant="light" color="blue">
              <Activity size={14} />
            </ThemeIcon>
            <Text fw={500}>
              Historial de Actividades 
              {/* 🆕 Mostrar información del prisionero */}
              <Text component="span" size="sm" c="dimmed" ml="xs">
                (ID: {prisonerId})
              </Text>
            </Text>
          </Group>
          <Badge variant="light">{filteredActivities.length} registros</Badge>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Buscar actividades..."
              leftSection={<Search size={16} />}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              placeholder="Filtrar por tipo"
              leftSection={<Filter size={16} />}
              clearable
              data={[
                { value: 'medical', label: 'Médico' },
                { value: 'legal', label: 'Legal' },
                { value: 'education', label: 'Educativo' },
                { value: 'incident', label: 'Incidente' },
                { value: 'visit', label: 'Visita' }
              ]}
              value={filterType}
              onChange={setFilterType}
            />
          </Grid.Col>
        </Grid>
      </Card>

      {/* Timeline de Actividades */}
      <Card withBorder padding="lg">
        {filteredActivities.length > 0 ? (
          <Timeline bulletSize={24} lineWidth={2}>
            {filteredActivities.map((activity) => (
              <Timeline.Item
                key={activity.id}
                bullet={getActivityIcon(activity.type)}
                title={
                  <Group justify="space-between" align="flex-start">
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group gap="xs">
                        <Text fw={500}>{activity.title}</Text>
                        <Badge 
                          size="xs" 
                          color={getActivityColor(activity.type, activity.status)}
                          variant="light"
                        >
                          {activity.type === 'medical' && 'Médico'}
                          {activity.type === 'legal' && 'Legal'}
                          {activity.type === 'education' && 'Educativo'}
                          {activity.type === 'incident' && 'Incidente'}
                          {activity.type === 'visit' && 'Visita'}
                        </Badge>
                        {activity.priority === 'high' && (
                          <Badge size="xs" color="red" variant="filled">
                            Alta
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed">
                        {activity.description}
                      </Text>
                    </Stack>
                    <Stack gap="xs" align="flex-end">
                      <Text size="xs" c="dimmed">
                        {new Date(activity.date).toLocaleDateString()}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {activity.time}
                      </Text>
                    </Stack>
                  </Group>
                }
                color={getActivityColor(activity.type, activity.status)}
              />
            ))}
          </Timeline>
        ) : (
          <Text ta="center" c="dimmed" py="xl">
            {activities.length === 0 
              ? `No hay actividades registradas para el recluso ${prisonerId}` 
              : 'No se encontraron actividades que coincidan con los filtros'
            }
          </Text>
        )}
      </Card>

      {/* Estadísticas rápidas */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="md" ta="center">
            <Text size="xl" fw={700} c="blue">
              {activities.filter(a => a.type === 'medical').length}
            </Text>
            <Text size="sm" c="dimmed">Consultas Médicas</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="md" ta="center">
            <Text size="xl" fw={700} c="purple">
              {activities.filter(a => a.type === 'legal').length}
            </Text>
            <Text size="sm" c="dimmed">Actividades Legales</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="md" ta="center">
            <Text size="xl" fw={700} c="green">
              {activities.filter(a => a.type === 'education').length}
            </Text>
            <Text size="sm" c="dimmed">Actividades Educativas</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="md" ta="center">
            <Text size="xl" fw={700} c="red">
              {activities.filter(a => a.type === 'incident').length}
            </Text>
            <Text size="sm" c="dimmed">Incidentes</Text>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};