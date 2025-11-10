import { useEffect, useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Card,
  Badge,
  Divider,
  Grid,
} from '@mantine/core';
import { IconUser, IconListCheck, IconRepeat, IconDatabase } from '@tabler/icons-react';
import api from '../../../shared/services/api';
import { useGlobalContext } from '../../../shared/hooks/useGlobalContext';
import { Loading } from '../../../shared/components/Loading';

interface UserStats {
  overview: {
    total_activities: number;
    total_sessions: number;
    total_data_changes: number;
  };
  trends: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
  };
  sessions_summary: {
    last_login: string;
    total_login_count: number;
    most_used_ip: string;
  };
}

const UsageStatsCard = () => {
  const { user } = useGlobalContext();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    api.get(`/audit/stats/user/${user.id}`)
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar las estadísticas');
        setLoading(false);
      });
  }, [user?.id]);

  if (!user?.id) return <Loading />;
  
  if (loading) 
    return (
      <Paper shadow="sm" p="lg" radius="md">
        <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loading />
        </div>
      </Paper>
    );
  
  if (error || !stats) 
    return (
      <Paper shadow="sm" p="lg" radius="md">
        <Text c="red">{error || 'Error al cargar datos'}</Text>
      </Paper>
    );

  const { overview, trends, sessions_summary } = stats;

  return (
    <Paper shadow="sm" p="lg" radius="md">
      <Title order={3} c="dark" mb="md">Estadísticas de Uso</Title>
      <Divider label="Resumen" my="sm" />
      <Grid gutter="md" mb="md">
        <Grid.Col span={6}>
          <Card shadow="xs" radius="sm" withBorder>
            <Group gap="sm">
              <IconUser size={22} color="#1976d2" />
              <Stack gap={0}>
                <Text size="sm" fw={500}>{user.name}</Text>
                <Text size="xs" c="dimmed">{user.email}</Text>
                <Badge color="gray" size="sm">{user.role}</Badge>
              </Stack>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card shadow="xs" radius="sm" withBorder>
            <Group gap="sm">
              <IconListCheck size={22} color="#388e3c" />
              <Stack gap={0}>
                <Text size="sm" fw={500}>Total actividades</Text>
                <Text size="xl" fw={700} c="green">{overview.total_activities}</Text>
              </Stack>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card shadow="xs" radius="sm" withBorder>
            <Group gap="sm">
              <IconRepeat size={22} color="#f57c00" />
              <Stack gap={0}>
                <Text size="sm" fw={500}>Total sesiones</Text>
                <Text size="xl" fw={700} c="orange">{overview.total_sessions}</Text>
              </Stack>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card shadow="xs" radius="sm" withBorder>
            <Group gap="sm">
              <IconDatabase size={22} color="#7b1fa2" />
              <Stack gap={0}>
                <Text size="sm" fw={500}>Cambios de datos</Text>
                <Text size="xl" fw={700} c="violet">{overview.total_data_changes}</Text>
              </Stack>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
      <Group gap="md" mb="md">
        <Badge color="blue">ÚLTIMAS 24H: {trends.last_24h}</Badge>
        <Badge color="indigo">ÚLTIMOS 7 DÍAS: {trends.last_7d}</Badge>
        <Badge color="teal">ÚLTIMOS 30 DÍAS: {trends.last_30d}</Badge>
      </Group>     
      <Divider label="Sesiones" my="sm" />
      <Group gap="md" mb="md">
        <Badge color="green">Último inicio de sesión: {new Date(sessions_summary.last_login).toLocaleString()}</Badge>
        <Badge color="blue">Total inicios de sesión: {sessions_summary.total_login_count}</Badge>
      </Group>
    </Paper>
  );
};

export default UsageStatsCard;