import { 
  Container, 
  Title, 
  Text, 
  Group, 
  Select, 
  Paper, 
  Stack,
  Grid,
  Badge,
  Avatar,
  Divider
} from '@mantine/core';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  UserPlus,
  Clock
} from 'lucide-react';
import { useState } from 'react';
interface ActivityStat {
  title: string;
  value: number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}

interface ActivityRecord {
  id: string;
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  action: string;
  target: string;
  description: string;
  timestamp: string;
  type: 'login' | 'create' | 'update' | 'export';
}

const ActivityPage = () => {
  const [actionFilter, setActionFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');

  const stats: ActivityStat[] = [
    {
      title: 'Acciones Hoy',
      value: 47,
      subtitle: '12 vs ayer',
      color: 'purple',
      icon: <TrendingUp size={20} />
    },
    {
      title: 'Usuarios Activos',
      value: 3,
      subtitle: 'En línea ahora',
      color: 'green',
      icon: <Users size={20} />
    },
    {
      title: 'Reportes Generados',
      value: 8,
      subtitle: 'Esta semana',
      color: 'pink',
      icon: <FileText size={20} />
    },
    {
      title: 'Nuevos Registros',
      value: 15,
      subtitle: 'Este mes',
      color: 'orange',
      icon: <UserPlus size={20} />
    }
  ];

  const activities: ActivityRecord[] = [
    {
      id: '1',
      user: {
        name: 'María Elena Rodríguez',
        role: '@secretario',
        avatar: undefined
      },
      action: 'Ingresó al Sistema',
      target: 'Sistema',
      description: 'Inicio de sesión exitoso desde IP 192.168.1.45',
      timestamp: '2024-01-25 09:30:15',
      type: 'login'
    },
    {
      id: '2',
      user: {
        name: 'William García Vargas',
        role: '@director',
        avatar: undefined
      },
      action: 'Creó nuevo interno',
      target: 'Juan Carlos Pérez',
      description: 'Registro completo con información personal y legal',
      timestamp: '2024-01-25 09:15:22',
      type: 'create'
    },
    {
      id: '3',
      user: {
        name: 'Carlos Alberto Mendoza',
        role: '@secretario2',
        avatar: undefined
      },
      action: 'Actualizó expediente médico',
      target: 'Ana Sofía Ramírez',
      description: 'Agregó registro médico: Hipertensión arterial',
      timestamp: '2024-01-25 08:45:10',
      type: 'update'
    },
    {
      id: '4',
      user: {
        name: 'María Elena Rodríguez',
        role: '@secretario',
        avatar: undefined
      },
      action: 'Generó reporte mensual',
      target: 'Reporte de Población',
      description: 'Exportó 847 registros en formato Excel',
      timestamp: '2024-01-25 08:30:05',
      type: 'export'
    }
  ];

  const getActionColor = (type: string) => {
    switch (type) {
      case 'login': return 'blue';
      case 'create': return 'green';
      case 'update': return 'purple';
      case 'export': return 'orange';
      default: return 'gray';
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'login': return 'Login';
      case 'create': return 'Create';
      case 'update': return 'Update';
      case 'export': return 'Export';
      default: return 'Action';
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const getUserColor = (role: string) => {
    if (role.includes('director')) return 'blue';
    if (role.includes('secretario')) return 'green';
    return 'gray';
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
            <Group gap="xs">
              <Select
                placeholder="Filtrar acciones"
                value={actionFilter}
                onChange={(value) => setActionFilter(value || 'all')}
                data={[
                  { value: 'all', label: 'Todas las acciones' },
                  { value: 'login', label: 'Inicios de sesión' },
                  { value: 'create', label: 'Creaciones' },
                  { value: 'update', label: 'Actualizaciones' },
                  { value: 'export', label: 'Exportaciones' }
                ]}
                style={{ minWidth: 180 }}
              />
              <Select
                placeholder="Periodo"
                value={timeFilter}
                onChange={(value) => setTimeFilter(value || 'today')}
                data={[
                  { value: 'today', label: 'Hoy' },
                  { value: 'week', label: 'Esta semana' },
                  { value: 'month', label: 'Este mes' },
                  { value: 'year', label: 'Este año' }
                ]}
                style={{ minWidth: 120 }}
              />
            </Group>
          </Group>
        </div>

        {/* Estadísticas */}
        <Grid>
          {stats.map((stat, index) => (
            <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
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
            </Grid.Col>
          ))}
        </Grid>

        {/* Registro de Actividades */}
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3} size="h4">
              Registro de Actividades ({activities.length})
            </Title>
          </Group>

          <Stack gap="md">
            {activities.map((activity, index) => (
              <div key={activity.id}>
                <Group justify="space-between" align="flex-start">
                  <Group align="flex-start" gap="md">
                    <Avatar
                      size="md"
                      color={getUserColor(activity.user.role)}
                      src={activity.user.avatar}
                    >
                      {getUserInitials(activity.user.name)}
                    </Avatar>
                    
                    <div style={{ flex: 1 }}>
                      <Group gap="xs" mb={4}>
                        <Text fw={500} size="sm">
                          {activity.user.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          ({activity.user.role})
                        </Text>
                      </Group>
                      
                      <Text size="sm" mb={2}>
                        {activity.action} → <Text span fw={500} c="blue">{activity.target}</Text>
                      </Text>
                      
                      <Text size="xs" c="dimmed">
                        {activity.description}
                      </Text>
                    </div>
                  </Group>

                  <Group gap="xs" align="center">
                    <Badge
                      size="sm"
                      color={getActionColor(activity.type)}
                      variant="light"
                    >
                      {getActionLabel(activity.type)}
                    </Badge>
                    <div style={{ textAlign: 'right' }}>
                      <Text size="xs" c="dimmed">
                        <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {activity.timestamp}
                      </Text>
                    </div>
                  </Group>
                </Group>
                
                {index < activities.length - 1 && <Divider my="md" />}
              </div>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default ActivityPage;
