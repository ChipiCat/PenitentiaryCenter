import { useEffect, useState } from "react";
import {
  Paper,
  Title,
  Text,
  Timeline,
  Group,
  Badge,
  Pagination,
} from "@mantine/core";
import api from "../../../shared/services/api";
import { useGlobalContext } from "../../../shared/hooks/useGlobalContext";
import { Loading } from "../../../shared/components/Loading";
import {
  adaptActivityToActivityLog,
  translateUserAction,
} from "../../../shared/utils/activityLogSpanishUtils";
import { IconInfoCircle } from "@tabler/icons-react";
import { iconMap } from "../../../shared/utils/activityLogUtils";
import type { ActivityLog } from "../../../shared/types";

const actionLabels: Record<string, string> = {
  FILE_UPLOAD: "SUBIR ARCHIVO",
  FILE_DELETE: "ELIMINAR ARCHIVO",
  CREATE: "CREAR",
  PRISONER_REGISTERED: "REGISTRO DE RECLUSO",
  INFO: "INFORMACIÓN",
  SUCCESS: "ÉXITO",
  LOGIN: "INICIO DE SESIÓN",
  LOGOUT: "CIERRE DE SESIÓN",
  USER_CREATED: "USUARIO CREADO",
  USER_DELETED: "USUARIO ELIMINADO",
  LOGIN_FAILED: "INICIO FALLIDO",
  TOKEN_REFRESHED: "TOKEN ACTUALIZADO",
};

const moduleLabels: Record<string, string> = {
  FILES: "ARCHIVOS",
  MEDICAL: "REGISTRO MÉDICO",
  AUTH: "AUTENTICACIÓN",
  USER: "USUARIO",
  PRISONER: "RECLUSO",
};

const RecentActivityCard = () => {
  const { user } = useGlobalContext();
  const [stats, setStats] = useState<{
    recent_activities: ActivityLog[];
  } | null>(null);
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

  if (!user?.id) return <Loading />;
  if (loading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
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
            bullet={iconMap[activity.action] || <IconInfoCircle size={16} />}
            color="blue"
            title={translateUserAction(adaptActivityToActivityLog(activity))}
          >
            <Group gap={8} mb={4}>
              <Badge color="blue" size="sm">
                {actionLabels[activity.action] || activity.action}
              </Badge>
              <Badge color="gray" size="sm">
                {moduleLabels[activity.module] || activity.module}
              </Badge>
            </Group>
            {activity.prisoner_related &&
              activity.prisoner_related.identity && (
                <Text c="dimmed" size="sm">
                  <b>Prisionero:</b>{" "}
                  {activity.prisoner_related.identity.firstName}{" "}
                  {activity.prisoner_related.identity.surname}
                </Text>
              )}
            {activity.metadata?.prisoner && (
              <Text c="dimmed" size="sm">
                <b>Prisionero extra:</b> {activity.metadata.prisoner}
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
