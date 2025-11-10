import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Group,
  Stack,
  Card,
  Divider,
  Badge,
  Code,
  Accordion,
  Box,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { useSystemActivity } from "./hooks/useSystemActivity";
import { CustomPagination } from "../../shared/components/CustomPagination";
import { Loading } from "../../shared/components/Loading";
import {
  severityLabels,
  statusLabels,
  moduleLabels,
  entityLabels,
} from "../../shared/utils/activityLogUtils";
import { getActivityIcon, translateUserAction, translateLogout } from "../../shared/utils/activityLogSpanishUtils";

const ActivityPage = () => {
  const {
    filteredActivities,
    loading,  // Agrega esto si el hook lo retorna
  } = useSystemActivity();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const totalPages = Math.ceil(filteredActivities.length / pageSize);

  const paginatedActivities = filteredActivities.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Group justify="space-between" mb="xs">
            <div>
              <Title order={2}>Actividad Global del Sistema</Title>
              <Text c="dimmed" size="sm">
                Monitoreo completo de todas las acciones realizadas por los
                usuarios
              </Text>
            </div>
          </Group>
        </div>

        <Divider
          label={`Registro de Actividades (${filteredActivities.length})`}
          labelPosition="left"
          my="sm"
        />

        <Stack gap="md">
          {loading ? (
            <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loading />
            </div>
          ) : paginatedActivities.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No hay actividades para mostrar.
            </Text>
          ) : (
            <>
              <Accordion variant="contained" radius="md">
                {paginatedActivities.map((activity) => (
                  <Accordion.Item key={activity.id} value={activity.id}>
                    <Accordion.Control>
                      <Group gap={12} align="center">
                        {getActivityIcon(activity.action)}
                        <Box>
                          <Text size="md">{translateUserAction(activity)}</Text>
                          <Group gap={16}>
                            <Text size="xs" c="dimmed">
                              {new Date(activity.timestamp).toLocaleDateString("es-ES")}
                            </Text>
                            <Text size="xs" c="gray">
                              Por: <b>{activity.user?.name}</b>
                            </Text>
                          </Group>
                        </Box>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap={10}>
                        <Group align="flex-start" grow>
                          <Stack gap={4} style={{ flex: 1 }}>
                            <Text size="sm" c="dimmed">Fecha completa:</Text>
                            <Text size="sm">{new Date(activity.timestamp).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</Text>
                            <Text size="sm" c="dimmed">Realizado por:</Text>
                            <Text size="sm">{activity.user?.name}</Text>
                            <Text size="sm" c="dimmed">Área:</Text>
                            <Text size="sm">{moduleLabels[activity.module] || activity.module}</Text>
                            <Text size="sm" c="dimmed">Tipo de registro:</Text>
                            <Text size="sm">{entityLabels[activity.entity_type] || activity.entity_type}</Text>
                            <Text size="sm" c="dimmed">Importancia:</Text>
                            <Text size="sm">{severityLabels[activity.severity] || activity.severity}</Text>
                          </Stack>
                          <Stack gap={4} style={{ flex: 1 }}>
                            <Text size="sm" c="dimmed">Detalle:</Text>
                            <Text size="sm">{translateUserAction(activity)}</Text>
                            <Text size="sm" c="dimmed">Rol:</Text>
                            <Text size="sm">{activity.user?.role === "ADMIN" ? "Administrador" : activity.user?.role}</Text>
                            <Text size="sm" c="dimmed">Resultado:</Text>
                            <Text size="sm">{statusLabels[activity.status] || activity.status}</Text>
                          </Stack>
                        </Group>
                        {activity.changes && activity.changes.length > 0 && (
                          <Stack gap={4} mt={6} p={4} style={{ background: "#f3f6fa", borderRadius: 6 }}>
                            {activity.changes.map((chg, idx) => (
                              <Box key={idx} mt={8} p={10} style={{ background: "#f8f9fa", borderRadius: 8, border: "1px solid #e0e0e0" }}>
                                <Group grow>
                                  <Stack gap={2}>
                                    <Text size="xs" fw={600} c="dimmed">Cambios realizados: {chg.field || chg.key || ""}</Text>
                                    <Text size="xs"><b>Antes:</b> {chg.old_value ?? chg.oldValue ?? ""}</Text>
                                    <Text size="xs"><b>Ahora:</b> {chg.new_value ?? chg.newValue ?? ""}</Text>
                                  </Stack>
                                  <Stack gap={2}>
                                    <Text size="xs"><b>Hora exacta:</b> {new Date(activity.timestamp).toLocaleTimeString("es-ES")}</Text>
                                  </Stack>
                                </Group>
                              </Box>
                            ))}
                          </Stack>
                        )}

                        {activity.prisoner_related && (
                          <Stack gap={4} mt={6}>
                            <Text size="sm" c="dimmed">Prisionero relacionado:</Text>
                            <Link to={`/reclusos/${activity.prisoner_related.id}`} style={{ textDecoration: "none" }}>
                              <Badge>
                                {activity.prisoner_related.identity
                                  ? `${activity.prisoner_related.identity.firstName} ${activity.prisoner_related.identity.surname}`
                                  : "Ver perfil"}
                              </Badge>
                            </Link>
                          </Stack>
                        )}
                        {activity.metadata && activity.metadata.deleted_user_id ? (
                          <Card shadow="xs" radius="sm" withBorder mt={4}>
                            <Stack gap={2}>
                              <Text size="sm" fw={500} c="red">
                                Usuario eliminado
                              </Text>
                              <Text size="sm">
                                Nombre: <b>{activity.metadata.deleted_user_name}</b>
                              </Text>
                              <Text size="sm">
                                Email: <b>{activity.metadata.deleted_user_email}</b>
                              </Text>
                              <Text size="sm">
                                ID: <Code>{activity.metadata.deleted_user_id}</Code>
                              </Text>
                            </Stack>
                          </Card>
                        ) : null}
                        {activity.metadata && activity.metadata.logout_reason && (
                          <Stack gap={2} mt={4}>
                            <Text size="sm" c="dimmed">Motivo de cierre de sesión:</Text>
                            <Text size="sm">{translateLogout(String(activity.metadata.logout_reason))}</Text>
                          </Stack>
                        )}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>

              <CustomPagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                total={filteredActivities.length}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            </>
          )}
        </Stack>
      </Stack>
    </Container>
  );
};

export default ActivityPage;