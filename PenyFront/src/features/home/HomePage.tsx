import {
  Container,
  Title,
  Text,
  Grid,
  Paper,
  Group,
  Stack,
  Button,
  ThemeIcon,
  Timeline,
} from "@mantine/core";
import {
  Users,
  UserCheck,
  Scale,
  CheckCircle,
  Plus,
  Search,
  FileText,
  Eye,
  User,
  Calendar,
  Shield,
  FileCheck,
} from "lucide-react";
import { useGlobalContext } from "../../shared/hooks/useGlobalContext";
import { useNavigate } from "react-router";
import { ROUTES } from "../../shared/config/routes";

const HomePage = () => {
  const { user } = useGlobalContext();
  const navigate = useNavigate();

  // Datos de estadísticas (estos vendrían de tu API)
  const stats = [
    {
      title: "Total de Internos",
      value: "847",
      change: "+12 este mes",
      changeType: "positive",
      icon: Users,
      color: "blue",
    },
    {
      title: "Internos Activos",
      value: "823",
      change: "+8 este mes",
      changeType: "positive",
      icon: UserCheck,
      color: "green",
    },
    {
      title: "En Proceso Legal",
      value: "156",
      change: "-3 este mes",
      changeType: "negative",
      icon: Scale,
      color: "red",
    },
    {
      title: "Liberaciones Este Mes",
      value: "24",
      change: "+5 este mes",
      changeType: "positive",
      icon: CheckCircle,
      color: "teal",
    },
  ];

  // Acciones rápidas
  const quickActions = [
    {
      title: "Nuevo Interno",
      description: "Registrar nuevo interno",
      icon: Plus,
      color: "violet",
      onClick: () => navigate(ROUTES.PRISONERS),
    },
    {
      title: "Buscar Expediente",
      description: "Buscar expediente de interno",
      icon: Search,
      color: "green",
      onClick: () => navigate(ROUTES.PRISONERS),
    },
    {
      title: "Generar Reporte",
      description: "Crear nuevo reporte",
      icon: FileText,
      color: "violet",
      onClick: () => navigate(ROUTES.REPORTS),
    },
    {
      title: "Ver Reclusos",
      description: "Ver lista completa",
      icon: Eye,
      color: "orange",
      onClick: () => navigate(ROUTES.PRISONERS),
    },
  ];

  // Actividad reciente (esto vendría de tu API)
  const recentActivity = [
    {
      title: "Nuevo interno registrado: Juan Carlos Pérez",
      description: "Por: María Elena Rodríguez",
      time: "Hace 2 horas",
      icon: User,
      color: "blue",
    },
    {
      title: "Expediente actualizado: Ana García Silva",
      description: "Por: Carlos Alberto Díaz",
      time: "Hace 4 horas",
      icon: FileCheck,
      color: "green",
    },
    {
      title: "Mandamiento de liberación procesado",
      description: "Por: William García Vargas",
      time: "Hace 6 horas",
      icon: Shield,
      color: "teal",
    },
    {
      title: "Reporte mensual generado",
      description: "Por: María Elena Rodríguez",
      time: "Hace 1 día",
      icon: Calendar,
      color: "violet",
    },
    {
      title: "Nuevo usuario creado: Luis Fernando",
      description: "Por: William García Vargas",
      time: "Hace 2 días",
      icon: User,
      color: "blue",
    },
  ];

  return (
    <Container size="xl" py="md">
      {/* Encabezado de bienvenida */}
      <Stack gap="xl">
        <div>
          <Title order={2} mb={4}>
            Bienvenido,{" "}
            {user?.role === "ADMIN"
              ? "Director"
              : user?.role === "SECRETARY"
              ? "Secretario"
              : "Usuario"}
          </Title>
          <Text c="dimmed">Resumen general del centro penitenciario</Text>
        </div>

        {/* Estadísticas principales */}
        <Grid>
          {stats.map((stat, index) => (
            <Grid.Col key={index} span={{ base: 12, xs: 6, md: 3 }}>
              <Paper p="md" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="sm" fw={500}>
                      {stat.title}
                    </Text>
                    <Text size="xl" fw={700}>
                      {stat.value}
                    </Text>
                    <Text
                      size="xs"
                      c={stat.changeType === "positive" ? "teal" : "red"}
                      fw={500}
                    >
                      {stat.change}
                    </Text>
                  </div>
                  <ThemeIcon
                    color={stat.color}
                    variant="light"
                    radius="md"
                    size="lg"
                  >
                    <stat.icon size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>

        {/* Sección principal con acciones y actividad */}
        <Grid>
          {/* Acciones rápidas */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="lg" radius="md" withBorder h="100%">
              <Title order={4} mb="md">
                Acciones Rápidas
              </Title>
              <Stack gap="xs">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="light"
                    color={action.color}
                    size="md"
                    leftSection={<action.icon size={18} />}
                    onClick={action.onClick}
                    fullWidth
                    justify="flex-start"
                  >
                    {action.title}
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Actividad reciente */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="lg" radius="md" withBorder h="100%">
              <Title order={4} mb="md">
                Actividad Reciente
              </Title>
              <Timeline active={-1} bulletSize={24} lineWidth={2}>
                {recentActivity.map((activity, index) => (
                  <Timeline.Item
                    key={index}
                    bullet={
                      <ThemeIcon
                        size={22}
                        variant="filled"
                        color={activity.color}
                        radius="xl"
                      >
                        <activity.icon size={12} />
                      </ThemeIcon>
                    }
                  >
                    <Text size="sm" fw={500}>
                      {activity.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {activity.description}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {activity.time}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default HomePage;
