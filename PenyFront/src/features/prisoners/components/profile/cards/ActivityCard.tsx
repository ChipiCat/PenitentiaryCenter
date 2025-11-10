import React, { useEffect, useState } from "react";
import {
  Card,
  Group,
  Title,
  Text,
  Stack,
  ThemeIcon,
  Accordion,
  Box,
} from "@mantine/core";
import {
  Activity,
  Upload,
  Trash2,
  UserPlus,
  FileText,
  Info,
  ShieldCheck,
} from "lucide-react";
import type { ActivityLog } from "../../../../../shared/types/activityLogTypes";
import { fetchPrisonerTimeline } from "../../../../../shared/services/auditService";
import { Loading } from "../../../../../shared/components/Loading";
import { CustomPagination } from "../../../../../shared/components/CustomPagination";

interface ActivityCardProps {
  prisonerId: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ prisonerId }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const data = await fetchPrisonerTimeline({
          prisonerId,
          limit: pageSize,
          page,
        });
        setActivities(data?.events || []);
        setTotalPages(data?.pagination?.total_pages || 1);
        setTotal(data?.pagination?.total || 0);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [prisonerId, page, pageSize]);

  function getActivityIcon(action: string) {
    switch (action) {
      case "FILE_UPLOAD":
        return (
          <ThemeIcon color="green" variant="light" size="sm">
            <Upload size={16} />
          </ThemeIcon>
        );
      case "FILE_DELETE":
        return (
          <ThemeIcon color="red" variant="light" size="sm">
            <Trash2 size={16} />
          </ThemeIcon>
        );
      case "CREATE":
        return (
          <ThemeIcon color="blue" variant="light" size="sm">
            <FileText size={16} />
          </ThemeIcon>
        );
      case "PRISONER_REGISTERED":
        return (
          <ThemeIcon color="teal" variant="light" size="sm">
            <UserPlus size={16} />
          </ThemeIcon>
        );
      case "INFO":
        return (
          <ThemeIcon color="gray" variant="light" size="sm">
            <Info size={16} />
          </ThemeIcon>
        );
      case "SUCCESS":
        return (
          <ThemeIcon color="indigo" variant="light" size="sm">
            <ShieldCheck size={16} />
          </ThemeIcon>
        );
      default:
        return (
          <ThemeIcon color="gray" variant="light" size="sm">
            <Activity size={16} />
          </ThemeIcon>
        );
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <Card withBorder padding="lg" h="100%">
      <Group mb="md" gap={6}>
        <ThemeIcon variant="transparent" color="#20263c">
          <Activity size={20} />
        </ThemeIcon>
        <Title order={3} size="h4">
          Actividad
        </Title>
      </Group>
      <Stack gap="md">
        {loading ? (
          <div
            style={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loading />
          </div>
        ) : activities && activities.length > 0 ? (
          <>
            <Accordion variant="contained" radius="md">
              {activities.map((act) => {
                return (
                  <Accordion.Item key={act.id} value={act.id}>
                    <Accordion.Control>
                      <Group gap={12} align="center">
                        {getActivityIcon(act.action)}
                        <Box>
                          <Text size="md">{act.description}</Text>
                          <Group gap={16}>
                            <Text size="xs" c="dimmed">
                              {new Date(act.timestamp).toLocaleDateString(
                                "es-ES"
                              )}
                            </Text>
                            <Text size="xs" c="gray">
                              Por: <b>{act.user?.name}</b>{" "}
                              {act.user?.email && (
                                <>@{act.user.email.split("@")[0]}</>
                              )}
                            </Text>
                          </Group>
                        </Box>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap={10}>
                        <Group align="flex-start" grow>
                          <Stack gap={4} style={{ flex: 1 }}>
                            <Text size="sm" c="dimmed">
                              Fecha completa:
                            </Text>
                            <Text size="sm">
                              {new Date(act.timestamp).toLocaleDateString(
                                "es-ES",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </Text>
                            <Text size="sm" c="dimmed">
                              Realizado por:
                            </Text>
                            <Text size="sm">
                              {act.user?.name}{" "}
                              {act.user?.email && (
                                <span style={{ color: "#888" }}>
                                  @{act.user.email.split("@")[0]}
                                </span>
                              )}
                            </Text>
                            <Text size="sm" c="dimmed">
                              Área:
                            </Text>
                            <Text size="sm">
                              {act.module === "PERSONAL"
                                ? "Personal"
                                : act.module === "IDENTITY"
                                ? "Identidad"
                                : act.module === "PRISONERS"
                                ? "Reclusos"
                                : act.module === "FILES"
                                ? "Archivos"
                                : act.module === "MEDICAL"
                                ? "Médico"
                                : act.module === "EDUCATION"
                                ? "Educación"
                                : act.module}
                            </Text>
                            <Text size="sm" c="dimmed">
                              Tipo de registro:
                            </Text>
                            <Text size="sm">
                              {act.entity_type === "PRISONER_PERSONAL"
                                ? "Información personal"
                                : act.entity_type === "PRISONER_IDENTITY"
                                ? "Identidad"
                                : act.entity_type === "PRISONER"
                                ? "Recluso"
                                : act.entity_type === "FILE"
                                ? "Archivo"
                                : act.entity_type === "MEDICAL_RECORD"
                                ? "Registro médico"
                                : act.entity_type === "EDUCATION_PROGRESS"
                                ? "Progreso educativo"
                                : act.entity_type}
                            </Text>
                            <Text size="sm" c="dimmed">
                              Importancia:
                            </Text>
                            <Text size="sm">
                              {act.severity === "INFO"
                                ? "Información"
                                : act.severity === "WARNING"
                                ? "Advertencia"
                                : act.severity}
                            </Text>
                          </Stack>
                          <Stack gap={4} style={{ flex: 1 }}>
                            <Text size="sm" c="dimmed">
                              Detalle:
                            </Text>
                            <Text size="sm">{act.description}</Text>
                            <Text size="sm" c="dimmed">
                              Usuario:
                            </Text>
                            <Text size="sm">{act.user?.name}</Text>
                            <Text size="sm" c="dimmed">
                              Correo:
                            </Text>
                            <Text size="sm">{act.user?.email}</Text>
                            <Text size="sm" c="dimmed">
                              Rol:
                            </Text>
                            <Text size="sm">
                              {act.user?.role === "ADMIN"
                                ? "Administrador"
                                : act.user?.role}
                            </Text>
                            <Text size="sm" c="dimmed">
                              Resultado:
                            </Text>
                            <Text size="sm">
                              {act.status === "SUCCESS" ? "Éxito" : act.status}
                            </Text>
                          </Stack>
                        </Group>
                        {act.changes && act.changes.length > 0 && (
                          <Stack
                            gap={4}
                            mt={6}
                            p={4}
                            style={{ background: "#f3f6fa", borderRadius: 6 }}
                          >
                            {act.changes.map((chg, idx) => (
                              <Box
                                key={idx}
                                mt={8}
                                p={10}
                                style={{
                                  background: "#f8f9fa",
                                  borderRadius: 8,
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                <Group grow>
                                  <Stack gap={2}>
                                    <Text size="xs" fw={600} c="dimmed">
                                      Cambios realizados:{" "}
                                      {chg.field || chg.key || ""}
                                    </Text>
                                    <Text size="xs">
                                      <b>Antes:</b>{" "}
                                      {chg.old_value ?? chg.oldValue ?? ""}
                                    </Text>
                                    <Text size="xs">
                                      <b>Ahora:</b>{" "}
                                      {chg.new_value ?? chg.newValue ?? ""}
                                    </Text>
                                  </Stack>
                                  <Stack gap={2}>
                                    <Text size="xs">
                                      <b>Hora exacta:</b>{" "}
                                      {new Date(
                                        act.timestamp
                                      ).toLocaleTimeString("es-ES")}
                                    </Text>
                                  </Stack>
                                </Group>
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
            {activities.length > 0 && (
              <CustomPagination
                currentPage={page}
                totalPages={totalPages || 1}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[10, 20, 50]}
              />
            )}
          </>
        ) : (
          <Text size="sm" c="dimmed">
            Sin actividad registrada.
          </Text>
        )}
      </Stack>
    </Card>
  );
};
