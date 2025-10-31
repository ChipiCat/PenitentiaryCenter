import { useCallback, useEffect, useState } from "react";
import { Container, Title, Text, Grid, Paper, Stack } from "@mantine/core";
import { Plus, Search, Eye } from "lucide-react";
import { useGlobalContext } from "../../shared/hooks/useGlobalContext";
import { useNavigate } from "react-router";
import { ROUTES } from "../../shared/config/routes";
import { RecentActivityCard } from "../profile/components";
import { ActionButton } from "./components/ActionButton";
import { PrisonersStats } from "../prisoners/components/list";
import type { PrisonerBase, Statistics } from "../../shared/types";
import { prisonersService } from "../../shared/services";

const HomePage = () => {
  const { user } = useGlobalContext();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Nuevo Recluso",
      description: "Registrar nuevo interno",
      icon: (
        <Plus className="bg-blue-200 text-blue-500 rounded-lg h-8 w-8 !p-1 text-lg" />
      ),
      color: "blue",
      onClick: () => navigate(ROUTES.PRISONERS),
    },
    {
      title: "Buscar Expediente",
      description: "Buscar expediente de interno",
      icon: (
        <Search className="bg-amber-200 text-amber-600 rounded-lg h-8 w-8 !p-1 text-lg" />
      ),
      color: "blue",
      onClick: () => navigate(ROUTES.PRISONERS),
    },
    {
      title: "Ver Reclusos",
      description: "Ver lista completa",
      icon: (
        <Eye className="bg-green-200 text-green-600 rounded-lg h-8 w-8 !p-1 text-lg" />
      ),
      color: "blue",
      onClick: () => navigate(ROUTES.PRISONERS),
    },
  ];

  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    activos: 0,
    trasladados: 0,
    liberados: 0,
    archivados: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const allPrisoners = await prisonersService.getPrisoners({ limit: 1000 });

      const stats = {
        total: allPrisoners.data?.length ?? 0,
        activos: allPrisoners.data?.filter(
          (p: PrisonerBase) => p.status === "Activo"
        ).length,
        trasladados: allPrisoners.data?.filter(
          (p: PrisonerBase) => p.status === "Trasladado"
        ).length,
        liberados: allPrisoners.data?.filter(
          (p: PrisonerBase) => p.status === "Liberado"
        ).length,
        archivados: allPrisoners.data?.filter(
          (p: PrisonerBase) => p.status === "Archivado"
        ).length,
      };

      setStatistics(stats);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

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

        <PrisonersStats statistics={statistics} />

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
