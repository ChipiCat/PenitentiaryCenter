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
  Loader,
  Grid,
} from '@mantine/core';
import { IconUser, IconListCheck, IconRepeat, IconDatabase } from '@tabler/icons-react';
import api from '../../../shared/services/api';
import { useGlobalContext } from '../../../shared/hooks/useGlobalContext';

interface UserStats {
  overview: {
    total_activities: number;
    total_sessions: number;
    total_data_changes: number;
  };
  activities_breakdown: {
    by_action: Record<string, number>;
    by_module: Record<string, number>;
    by_status: Record<string, number>;
    by_entity_type: Record<string, number>;
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

  if (!user?.id) return <Loader />;
  if (loading) return <Loader />;
  if (error || !stats) return <Text c="red">{error || 'Error al cargar datos'}</Text>;

  const { overview, activities_breakdown, trends, sessions_summary } = stats;

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
      <Divider label="Breakdown" my="sm" />
      <Grid gutter="md" mb="md">
        <Grid.Col span={6}>
          <Card shadow="xs" radius="sm" withBorder>
            <Text size="sm" fw={500} mb={4}>Por acción</Text>
            <Stack gap={2}>{Object.entries(activities_breakdown.by_action).map(([k, v]) => (
              <Group key={k} gap={4}><Badge color="blue" size="xs">{k}</Badge><Text size="xs">{String(v)}</Text></Group>
            ))}</Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card shadow="xs" radius="sm" withBorder>
            <Text size="sm" fw={500} mb={4}>Por módulo</Text>
            <Stack gap={2}>{Object.entries(activities_breakdown.by_module).map(([k, v]) => (
              <Group key={k} gap={4}><Badge color="indigo" size="xs">{k}</Badge><Text size="xs">{String(v)}</Text></Group>
            ))}</Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card shadow="xs" radius="sm" withBorder>
            <Text size="sm" fw={500} mb={4}>Por estado</Text>
            <Stack gap={2}>{Object.entries(activities_breakdown.by_status).map(([k, v]) => (
              <Group key={k} gap={4}><Badge color="teal" size="xs">{k}</Badge><Text size="xs">{String(v)}</Text></Group>
            ))}</Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card shadow="xs" radius="sm" withBorder>
            <Text size="sm" fw={500} mb={4}>Por entidad</Text>
            <Stack gap={2}>{Object.entries(activities_breakdown.by_entity_type).map(([k, v]) => (
              <Group key={k} gap={4}><Badge color="gray" size="xs">{k}</Badge><Text size="xs">{String(v)}</Text></Group>
            ))}</Stack>
          </Card>
        </Grid.Col>
      </Grid>
      <Divider label="Sesiones" my="sm" />
      <Group gap="md" mb="md">
        <Badge color="green">Último login: {new Date(sessions_summary.last_login).toLocaleString()}</Badge>
        <Badge color="blue">Total logins: {sessions_summary.total_login_count}</Badge>
        <Badge color="gray">IP más usada: {sessions_summary.most_used_ip}</Badge>
      </Group>
    </Paper>
  );
};

export default UsageStatsCard;
