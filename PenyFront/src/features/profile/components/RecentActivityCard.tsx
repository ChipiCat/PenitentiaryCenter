import { useEffect, useState } from "react";
import {
  Paper,
  Title,
  Text,
  Tooltip,
  Timeline,
  Group,
  Badge,
  Pagination,
} from "@mantine/core";
import { IconMessageDots } from "@tabler/icons-react";
import api from "../../../shared/services/api";
import { useGlobalContext } from "../../../shared/hooks/useGlobalContext";
import {
  iconMap,
  traducirDescripcion,
  actionLabels,
  moduleLabels,
} from "../../../shared/utils/activityLogUtils";
import { Loading } from "../../../shared/components/Loading";

interface Activity {
  id: string;
  action: string;
  module: string;
  ip_address: string;
  description: string;
  details?: string;
  timestamp: string;
}

const RecentActivityCard = () => {
  const { user } = useGlobalContext();
  const [stats, setStats] = useState<{ recent_activities: Activity[] } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    api
      .get(`/audit/stats/user/${user.id}`)
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar la actividad");
        setLoading(false);
      });
  }, [user?.id]);

  function traducirDescripcionCompleta(desc: string): string {
    return traducirDescripcion(desc);
  }

  if (!user?.id) return <Loading />;
  if (loading) return <div className=" w-full h-full flex items-center justify-center"><Loading /></div>;
  if (error || !stats)
    return <Text c="red">{error || "Error al cargar datos"}</Text>;

  const { recent_activities } = stats;
  const totalPages = Math.ceil(recent_activities.length / PAGE_SIZE);
  const paginatedActivities = recent_activities.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder h="100%">
      <Title order={4} c="dark" mb="md">
        Actividad Reciente
      </Title>
      <Timeline
        active={paginatedActivities.length}
        bulletSize={24}
        lineWidth={2}
      >
        {paginatedActivities.map((activity) => (
          <Timeline.Item
            key={activity.id}
            bullet={iconMap[activity.action] || <IconMessageDots size={16} />}
            color="blue"
            title={traducirDescripcionCompleta(activity.description)}
          >
            <Group gap={8} mb={4}>
              <Badge color="blue" size="sm">
                {actionLabels[activity.action] || activity.action}
              </Badge>
              <Badge color="gray" size="sm">
                {moduleLabels[activity.module] || activity.module}
              </Badge>
              <Tooltip label={activity.ip_address}>
                <Badge color="gray" size="xs">
                  IP
                </Badge>
              </Tooltip>
            </Group>
            {activity.details && (
              <Text c="dimmed" size="sm">
                {activity.details}
              </Text>
            )}
            <Text size="xs" mt={4}>
              {new Date(activity.timestamp).toLocaleString()}
            </Text>
          </Timeline.Item>
        ))}
      </Timeline>
      <Group justify="center" mt="md">
        <Pagination
          total={totalPages}
          value={page}
          onChange={setPage}
          size="sm"
          radius="md"
          color="blue"
        />
      </Group>
    </Paper>
  );
};

export default RecentActivityCard;
