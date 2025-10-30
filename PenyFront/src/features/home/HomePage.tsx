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
} from "@mantine/core";
import {
  Users,
  UserCheck,
  Scale,
  CheckCircle,
  Plus,
  Search,
  Eye,
} from "lucide-react";
import { useGlobalContext } from "../../shared/hooks/useGlobalContext";
import { useNavigate } from "react-router";
import { ROUTES } from "../../shared/config/routes";
import { RecentActivityCard } from "../profile/components";
import { ActionButton } from "./components/ActionButton";

const HomePage = () => {
  const { user } = useGlobalContext();
  const navigate = useNavigate();

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
      title: "Nuevo Recluso",
      description: "Registrar nuevo interno",
      icon: <Plus className="bg-blue-200 text-blue-500 rounded-lg h-8 w-8 !p-1 text-lg" />,
      color: "blue",
      onClick: () => navigate(ROUTES.PRISONERS),
    },
    {
      title: "Buscar Expediente",
      description: "Buscar expediente de interno",
      icon: <Search className="bg-amber-200 text-amber-600 rounded-lg h-8 w-8 !p-1 text-lg" />,
      color: "blue",
      onClick: () => navigate(ROUTES.PRISONERS),
    },
    {
      title: "Ver Reclusos",
      description: "Ver lista completa",
      icon: <Eye className="bg-green-200 text-green-600 rounded-lg h-8 w-8 !p-1 text-lg" />,
      color: "blue",
      onClick: () => navigate(ROUTES.PRISONERS),
    },
  ];

  return (
    <Container size="xl" py="md">
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

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="lg" radius="md" withBorder h="100%">
              <Title order={4} mb="md">
                Acciones Rápidas
              </Title>
              <Stack gap="xs">
                {quickActions.map((action, index) => (
                 <ActionButton
                    key={index}
                    title={action.title}
                    subtitle={action.description}
                    icon={action.icon}
                    onClick={action.onClick}
                  />
                ))}
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <RecentActivityCard />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default HomePage;
