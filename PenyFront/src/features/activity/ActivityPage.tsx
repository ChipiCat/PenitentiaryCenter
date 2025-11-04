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
  Code,
  Accordion,
  ThemeIcon,
  Box,
} from "@mantine/core";
import { Activity, Upload, Trash2, UserPlus, FileText, Info, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useSystemActivity } from "./hooks/useSystemActivity";
import {
  severityLabels,
  statusLabels,
  moduleLabels,
  entityLabels,
  traducirDescripcion,
} from "../../shared/utils/activityLogUtils";
import type { ActivityLog } from "../../shared/types/activityLogTypes";

const PAGE_SIZE = 10;

const ActivityPage = () => {
  const {
    filteredActivities,
  } = useSystemActivity();

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filteredActivities.length / PAGE_SIZE);

  const paginatedActivities = filteredActivities.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function traducirDescripcionCompleta(desc: string): string {
    return traducirDescripcion(desc);
  }

  function getActivityIcon(action: string) {
    switch (action) {
      case "FILE_UPLOAD":
        return <ThemeIcon color="green" variant="light" size="sm"><Upload size={16} /></ThemeIcon>;
      case "FILE_DELETE":
        return <ThemeIcon color="red" variant="light" size="sm"><Trash2 size={16} /></ThemeIcon>;
      case "CREATE":
        return <ThemeIcon color="blue" variant="light" size="sm"><FileText size={16} /></ThemeIcon>;
      case "PRISONER_REGISTERED":
        return <ThemeIcon color="teal" variant="light" size="sm"><UserPlus size={16} /></ThemeIcon>;
      case "INFO":
        return <ThemeIcon color="gray" variant="light" size="sm"><Info size={16} /></ThemeIcon>;
      case "SUCCESS":
        return <ThemeIcon color="indigo" variant="light" size="sm"><ShieldCheck size={16} /></ThemeIcon>;
      default:
        return <ThemeIcon color="gray" variant="light" size="sm"><Activity size={16} /></ThemeIcon>;
    }
  }

  function traducirMotivoLogout(reason: string): string {
    switch (reason) {
      case "USER_LOGOUT": return "Cierre de sesión voluntario";
      case "TOKEN_EXPIRED": return "Token expirado";
      case "SESSION_TIMEOUT": return "Sesión expirada por tiempo";
      case "FORCE_LOGOUT_BY_ADMIN": return "Cierre forzado por administrador";
      case "SUSPICIOUS_ACTIVITY": return "Actividad sospechosa";
      case "PASSWORD_CHANGED": return "Contraseña cambiada";
      case "ACCOUNT_DISABLED": return "Cuenta deshabilitada";
      case "DEVICE_LIMIT_REACHED": return "Límite de dispositivos alcanzado";
      default: return reason || "";
    }
  }

  function traducirAccionUsuario(activity: ActivityLog): string {
    if (activity.action === "LOGIN" && activity.user?.name)
      return `El usuario ${activity.user.name} inició sesión correctamente`;
    if (activity.action === "LOGOUT" && activity.user?.name)
      return `El usuario ${activity.user.name} cerró sesión`;
    if (activity.action === "USER_CREATED" && activity.user?.name)
      return `El usuario ${activity.user.name} fue creado`;
    if (activity.action === "USER_DELETED" && activity.user?.name)
      return `El usuario ${activity.user.name} fue eliminado`;
    if (activity.action === "LOGIN_FAILED")
      return `Intento fallido de inicio de sesión para ${activity.description.split(':')[0].replace('Failed login attempt for ', '').trim()}`;
    if (activity.action === "TOKEN_REFRESHED" && activity.user?.name)
      return `El usuario ${activity.user.name} actualizó el token de autenticación`;
    if (activity.action === "FILE_UPLOAD" || activity.action === "FILE_DELETE")
      return traducirDetalleArchivo(activity);
    return traducirDescripcionCompleta(activity.description);
  }

  function traducirDetalleArchivo(activity: ActivityLog): string {
    // Ejemplo: "Archivo subido: VS-Lab1-Development-310725-140502-2.pdf (mandate_document) para prisoner_mandate"
    if (activity.action === "FILE_UPLOAD" && activity.description) {
      // Extraer nombre de archivo y tipo
      const match = activity.description.match(/Archivo subido: (.+) \((.+)\) para (.+)/);
      if (match) {
        const nombreArchivo = match[1];
        const tipo = match[2];
        let tipoTraducido = "archivo";
        if (tipo === "mandate_document") tipoTraducido = "mandato";
        else if (tipo === "medical_file") tipoTraducido = "archivo médico";
        // No mostrar el identificador técnico (match[3])
        return `Archivo subido: ${nombreArchivo} (${tipoTraducido})`;
      }
    }
    if (activity.action === "FILE_DELETE" && activity.description) {
      // Ejemplo: "Archivo eliminado: VS-Lab1-Development-310725-140502-2.pdf (medical_file)"
      const match = activity.description.match(/Archivo eliminado: (.+) \((.+)\)/);
      if (match) {
        const nombreArchivo = match[1];
        const tipo = match[2];
        let tipoTraducido = "archivo";
        if (tipo === "mandate_document") tipoTraducido = "mandato";
        else if (tipo === "medical_file") tipoTraducido = "archivo médico";
        return `Archivo eliminado: ${nombreArchivo} (${tipoTraducido})`;
      }
    }
    return traducirDescripcionCompleta(activity.description);
  }

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
          {paginatedActivities.length === 0 ? (
            <Text c="dimmed" ta="center">
              No hay actividades para mostrar.
            </Text>
          ) : (
            <Accordion variant="contained" radius="md">
              {paginatedActivities.map((activity) => (
                <Accordion.Item key={activity.id} value={activity.id}>
                  <Accordion.Control>
                    <Group gap={12} align="center">
                      {getActivityIcon(activity.action)}
                      <Box>
                        <Text size="md">{traducirAccionUsuario(activity)}</Text>
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
                          <Text size="sm">
                            {activity.action === "LOGIN" && activity.user?.name
                              ? `El usuario ${activity.user.name} inició sesión correctamente`
                              : activity.action === "LOGOUT" && activity.user?.name
                              ? `El usuario ${activity.user.name} cerró sesión`
                              : activity.action === "USER_CREATED" && activity.user?.name
                              ? `El usuario ${activity.user.name} fue creado`
                              : activity.action === "USER_DELETED" && activity.user?.name
                              ? `El usuario ${activity.user.name} fue eliminado`
                              : activity.action === "LOGIN_FAILED"
                              ? `Intento fallido de inicio de sesión para ${activity.description.split(':')[0].replace('Failed login attempt for ', '').trim()}`
                              : activity.action === "TOKEN_REFRESHED" && activity.user?.name
                              ? `El usuario ${activity.user.name} actualizó el token de autenticación`
                              : activity.action === "FILE_UPLOAD" || activity.action === "FILE_DELETE"
                              ? traducirDetalleArchivo(activity)
                              : traducirDescripcionCompleta(activity.description)}
                          </Text>
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
                      {activity.prisoner_related_id && (
                        <Stack gap={4} mt={6}>
                          <Text size="sm" c="dimmed">Prisionero relacionado:</Text>
                          <Link to={`/reclusos/${activity.prisoner_related_id}`} style={{ textDecoration: "none" }}>
                            <Badge color="teal" variant="light" size="md" leftSection={<ThemeIcon color="gray" size="xs" radius="xl"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></ThemeIcon>}>
                              {activity.prisoner_related_id.includes?.name
                                ? activity.prisoner_related_id.includes.name
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
                          <Text size="sm">{traducirMotivoLogout(String(activity.metadata.logout_reason))}</Text>
                        </Stack>
                      )}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          )}

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
      </Stack>
    </Container>
  );
};

export default ActivityPage;
