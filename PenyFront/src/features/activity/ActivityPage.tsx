import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Group,
  Stack,
  Card,
  Pagination,
  Divider,
  Badge,
  Tooltip,
  Code,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconAlertTriangle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { SystemActivityFilters } from "./components/SystemActivityFilters";
import { useSystemActivity } from "./hooks/useSystemActivity";

const PAGE_SIZE = 10;

const severityColors = {
  INFO: "blue",
  WARNING: "yellow",
  ERROR: "red",
  SUCCESS: "green",
};
const severityIcons = {
  INFO: <IconInfoCircle size={16} />,
  WARNING: <IconAlertTriangle size={16} />,
  ERROR: <IconX size={16} />,
  SUCCESS: <IconCheck size={16} />,
};
const severityLabels: Record<string, string> = {
  INFO: "INFORMACIÓN",
  WARNING: "ADVERTENCIA",
  ERROR: "ERROR",
  SUCCESS: "ÉXITO",
};
const statusLabels: Record<string, string> = {
  SUCCESS: "ÉXITO",
  ERROR: "ERROR",
};
const moduleLabels: Record<string, string> = {
  AUTH: "AUTENTICACIÓN",
  FILES: "ARCHIVOS",
  PRISONERS: "PRISIONEROS",
  IDENTITY: "IDENTIDAD",
  USERS: "USUARIOS",
};
const actionLabels: Record<string, string> = {
  LOGIN: "INICIO DE SESIÓN",
  LOGOUT: "CIERRE DE SESIÓN",
  CREATE: "CREAR",
  FILE_UPLOAD: "SUBIR ARCHIVO",
  PRISONER_REGISTERED: "PRISIONERO REGISTRADO",
  TOKEN_REFRESHED: "TOKEN ACTUALIZADO",
  USER_DELETED: "USUARIO ELIMINADO",
};
const entityLabels: Record<string, string> = {
  USER: "USUARIO",
  FILE: "ARCHIVO",
  PRISONER: "PRISIONERO",
  PRISONER_IDENTITY: "IDENTIDAD DE PRISIONERO",
};

const ActivityPage = () => {
  const {
    actionFilter,
    setActionFilter,
    timeFilter,
    setTimeFilter,
    searchTerm,
    setSearchTerm,
    filteredActivities,
  } = useSystemActivity();

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filteredActivities.length / PAGE_SIZE);

  const paginatedActivities = filteredActivities.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function traducirDescripcion(desc: string): string {
    if (!desc) return "";
    // Traducciones comunes
    return desc
      .replace(
        /User ([^ ]+) logged in successfully/,
        "El usuario $1 inició sesión correctamente"
      )
      .replace(
        /User ([^ ]+) logged out \(USER_LOGOUT\)/,
        "El usuario $1 cerró sesión (USER_LOGOUT)"
      )
      .replace(
        /User ([^ ]+) refreshed authentication token/,
        "El usuario $1 actualizó el token de autenticación"
      )
      .replace(/Prisoner ([^ ]+) registered/, "Prisionero $1 registrado")
      .replace(
        /Archivo subido: (.+) \((.+)\) para prisoner_identity/,
        "Archivo subido: $1 ($2) para identidad de prisionero"
      )
      .replace(/Identidad creada: (.+)/, "Identidad creada: $1")
      .replace(
        /User ([^ ]+) \((.+)\) was deleted/,
        "El usuario $1 ($2) fue eliminado"
      );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Group justify="space-between" mb="xs">
            <div>
              <Title order={2}>Actividad Global del Sistema</Title>
              <Text c="dimmed" size="sm">
                Monitoreo completo de todas las acciones realizadas por los
                usuarios
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

        <Divider
          label={`Registro de Actividades (${filteredActivities.length})`}
          labelPosition="left"
          my="sm"
        />

        <Stack gap="md">
          {paginatedActivities.length === 0 ? (
            <Text c="dimmed" ta="center">
              No hay actividades para mostrar.
            </Text>
          ) : (
            paginatedActivities.map((activity) => (
              <Card key={activity.id} shadow="sm" radius="md" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Group>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "#eee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: 18,
                          color: "#888",
                        }}
                      >
                        {activity.user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </div>
                      <Stack gap={0}>
                        <Text fw={500}>
                          {activity.user?.name || "Usuario"}
                          <Text span c="dimmed" size="xs">
                            {" "}
                            ({activity.user?.role || "-"})
                          </Text>
                        </Text>
                        <Text size="xs" c="dimmed">
                          {activity.user?.email}
                        </Text>
                      </Stack>
                    </Group>
                    <Group gap={8}>
                      <Badge
                        color={
                          severityColors[
                            activity.severity as keyof typeof severityColors
                          ] || "gray"
                        }
                        leftSection={
                          severityIcons[
                            activity.severity as keyof typeof severityIcons
                          ] || null
                        }
                        variant="light"
                      >
                        {severityLabels[activity.severity] || activity.severity}
                      </Badge>
                      <Badge color="gray" variant="light">
                        {statusLabels[activity.status] || activity.status}
                      </Badge>
                      <Badge color="indigo" variant="light">
                        {moduleLabels[activity.module] || activity.module}
                      </Badge>
                    </Group>
                  </Group>
                  <Group gap={8}>
                    <Badge color="blue" variant="light" size="sm">
                      {actionLabels[activity.action] || activity.action}
                    </Badge>
                    <Badge color="gray" variant="light" size="sm">
                      {entityLabels[activity.entity_type] || activity.entity_type}
                    </Badge>
                    {activity.prisoner_related_id && (
                      <Badge color="teal" variant="light" size="sm">
                        PRISIONERO: {activity.prisoner_related_id}
                      </Badge>
                    )}
                  </Group>
                  <Text size="sm">{traducirDescripcion(activity.description)}</Text>
                  <Group gap={8}>
                    <Text size="xs" c="gray">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Text>
                    <Tooltip label={activity.ip_address}>
                      <Badge color="gray" variant="light" size="xs">
                        IP
                      </Badge>
                    </Tooltip>
                    <Tooltip label={activity.user_agent}>
                      <Badge color="gray" variant="light" size="xs">
                        AGENTE
                      </Badge>
                    </Tooltip>
                  </Group>
                  {activity.metadata && activity.metadata.deleted_user_id ? (
                    <Card shadow="xs" radius="sm" withBorder mt={4}>
                      <Stack gap={2}>
                        <Text size="sm" fw={500} c="red">Usuario eliminado</Text>
                        <Text size="sm">Nombre: <b>{activity.metadata.deleted_user_name}</b></Text>
                        <Text size="sm">Email: <b>{activity.metadata.deleted_user_email}</b></Text>
                        <Text size="sm">ID: <Code>{activity.metadata.deleted_user_id}</Code></Text>
                      </Stack>
                    </Card>
                  ) : (
                    activity.metadata && (
                      <Code block>{JSON.stringify(activity.metadata, null, 2)}</Code>
                    )
                  )}
                  {activity.data_changes &&
                    activity.data_changes.length > 0 && (
                      <Code block>
                        {JSON.stringify(activity.data_changes, null, 2)}
                      </Code>
                    )}
                </Stack>
              </Card>
            ))
          )}
        </Stack>

        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              value={page}
              onChange={setPage}
              total={totalPages}
              size="md"
              radius="md"
            />
          </Group>
        )}
      </Stack>
    </Container>
  );
};

export default ActivityPage;
