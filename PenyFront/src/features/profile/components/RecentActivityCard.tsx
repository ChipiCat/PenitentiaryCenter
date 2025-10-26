import { useEffect, useState, type JSX } from 'react';
import {
  Paper,
  Title,
  Text,
  Loader,
  Tooltip,
  Timeline,
  Group,
  Badge,
  Pagination,
} from '@mantine/core';
import {
  IconLogin,
  IconRefresh,
  IconPlus,
  IconUser,
  IconShieldCheck,
  IconCalendar,
  IconBox,
  IconId,
  IconGitCommit,
  IconMessageDots,
} from '@tabler/icons-react';
import api from '../../../shared/services/api';
import { useGlobalContext } from '../../../shared/hooks/useGlobalContext';

interface Activity {
  id: string;
  action: string;
  module: string;
  ip_address: string;
  description: string;
  details?: string;
  timestamp: string;
}

const iconMap: Record<string, JSX.Element> = {
  LOGIN: <IconLogin size={16} />,
  TOKEN_REFRESHED: <IconRefresh size={16} />,
  CREATE: <IconPlus size={16} />,
  BELONGING_REGISTERED: <IconBox size={16} />,
  USER_CREATED: <IconUser size={16} />,
  RELEASE_PROCESSED: <IconShieldCheck size={16} />,
  MONTHLY_REPORT: <IconCalendar size={16} />,
  EXPEDIENT_UPDATED: <IconGitCommit size={16} />,
  PRISONER_REGISTERED: <IconUser size={16} />,
  IDENTITY: <IconId size={16} />,
  CHILDREN: <IconUser size={16} />,
  MEDICAL: <IconShieldCheck size={16} />,
  PERSONAL: <IconUser size={16} />,
  FILE_UPLOAD: <IconBox size={16} />,
};

const RecentActivityCard = () => {
  const { user } = useGlobalContext();
  const [stats, setStats] = useState<{ recent_activities: Activity[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    api.get(`/audit/stats/user/${user.id}`)
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar la actividad');
        setLoading(false);
      });
  }, [user?.id]);

  function traducirDescripcionCompleta(desc: string): string {
    if (desc.includes('logged in successfully')) {
      const usuario = desc.match(/User (.+) logged in successfully/);
      return usuario ? `Usuario ${usuario[1]} inició sesión correctamente` : 'Inicio de sesión exitoso';
    }
    if (desc.includes('refreshed authentication token')) {
      const usuario = desc.match(/User (.+) refreshed authentication token/);
      return usuario ? `Usuario ${usuario[1]} actualizó el token de autenticación` : 'Token de autenticación actualizado';
    }
    return desc;
  }

  if (!user?.id) return <Loader />;
  if (loading) return <Loader />;
  if (error || !stats) return <Text c="red">{error || 'Error al cargar datos'}</Text>;

  const { recent_activities } = stats;
  const totalPages = Math.ceil(recent_activities.length / PAGE_SIZE);
  const paginatedActivities = recent_activities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder h="100%">
      <Title order={4} c="dark" mb="md">Actividad Reciente</Title>
      <Timeline active={paginatedActivities.length} bulletSize={24} lineWidth={2}>
        {paginatedActivities.map((activity) => (
          <Timeline.Item
            key={activity.id}
            bullet={iconMap[activity.action] || <IconMessageDots size={16} />}
            color="blue"
            title={traducirDescripcionCompleta(activity.description)}
          >
            <Group gap={8} mb={4}>
              <Badge color="blue" size="sm">{activity.action}</Badge>
              <Badge color="gray" size="sm">{activity.module}</Badge>
              <Tooltip label={activity.ip_address}><Badge color="gray" size="xs">IP</Badge></Tooltip>
            </Group>
            {activity.details && <Text c="dimmed" size="sm">{activity.details}</Text>}
            <Text size="xs" mt={4}>{new Date(activity.timestamp).toLocaleString()}</Text>
          </Timeline.Item>
        ))}
      </Timeline>
      <Group justify="center" mt="md">
        <Pagination total={totalPages} value={page} onChange={setPage} size="sm" radius="md" color="blue" />
      </Group>
    </Paper>
  );
};

export default RecentActivityCard;
