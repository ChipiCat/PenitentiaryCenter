import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Avatar,
  Badge,
  Tabs,
  Breadcrumbs,
  Anchor,
  LoadingOverlay,
  Menu,
  ActionIcon,
  Alert,
} from "@mantine/core";
import {
  ArrowLeft,
  Download,
  Edit,
  MoreVertical,
  User,
  FileText,
  Activity,
  Trash,
  AlertCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { modals } from "@mantine/modals";
import { ROUTES } from "../../../shared/config/routes";
import { usePrisoners } from "../hooks/usePrisoners"; // 🆕 Usar el mismo hook
import { PersonalInfo } from "../components/profile/PersonalInfo";
import { MedicalInfo } from "../components/profile/MedicalInfo";
import { LegalStatus } from "../components/profile/LegalStatus";
import { ActivityHistory } from "../components/profile/ActivityHistory";
import type { Prisoner } from "../types";

const PrisonerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 🆕 Usar usePrisoners y obtener el recluso por ID
  const {
    getPrisonerById,
    handleEditPrisoner,
    handleDeletePrisoner,
    handleDownloadPrisoner,
  } = usePrisoners();

  const [prisoner, setPrisoner] = useState<Prisoner | null>(null);

  useEffect(() => {
    const loadPrisoner = async () => {
      if (!id) {
        navigate(ROUTES.PRISONERS);
        return;
      }

      setLoading(true);

      // Simular delay de carga
      await new Promise((resolve) => setTimeout(resolve, 500));

      const foundPrisoner = getPrisonerById(id);

      if (!foundPrisoner) {
        navigate(ROUTES.PRISONERS);
        return;
      }

      setPrisoner(foundPrisoner);
      setLoading(false);
    };

    loadPrisoner();
  }, [id, getPrisonerById, navigate]);

  const openDeleteModal = () => {
    if (!prisoner) return;

    modals.openConfirmModal({
      title: "Confirmar eliminación",
      children: (
        <Text size="sm">
          ¿Está seguro de que desea dar de baja a {prisoner.fullName}? Esta
          acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        handleDeletePrisoner(prisoner.id);
        navigate(ROUTES.PRISONERS);
      },
    });
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (!prisoner) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<AlertCircle size={16} />}
          title="Recluso no encontrado"
          color="red"
        >
          <Text mb="md">No se encontró el recluso especificado.</Text>
          <Button
            variant="light"
            onClick={() => navigate(ROUTES.PRISONERS)}
            leftSection={<ArrowLeft size={16} />}
          >
            Volver a la lista
          </Button>
        </Alert>
      </Container>
    );
  }

  const breadcrumbItems = [
    { title: "Panel Principal", href: ROUTES.HOME },
    { title: "Reclusos", href: ROUTES.PRISONERS },
    { title: prisoner.fullName, href: "#" },
  ];

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          {breadcrumbItems.map((item, index) => (
            <Anchor
              key={index}
              onClick={() => item.href !== "#" && navigate(item.href)}
              style={{ cursor: item.href !== "#" ? "pointer" : "default" }}
              c={item.href === "#" ? "dimmed" : undefined}
            >
              {item.title}
            </Anchor>
          ))}
        </Breadcrumbs>

        {/* Header */}
        <Paper p="lg" withBorder radius="md" shadow="xs">
          <Group justify="space-between" mb="md">
            <Button
              variant="subtle"
              leftSection={<ArrowLeft size={16} />}
              onClick={() => navigate(ROUTES.PRISONERS)}
            >
              Volver a Reclusos
            </Button>

            <Group>
              <Button
                leftSection={<Download size={16} />}
                variant="light"
                color="purple"
                onClick={() => handleDownloadPrisoner(prisoner.id)}
              >
                Descargar PDF
              </Button>
              <Button
                leftSection={<Edit size={16} />}
                onClick={() => handleEditPrisoner(prisoner.id)}
              >
                Editar
              </Button>
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon variant="subtle" size="lg">
                    <MoreVertical size={18} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item leftSection={<FileText size={14} />}>
                    Generar reporte
                  </Menu.Item>
                  <Menu.Item leftSection={<Activity size={14} />}>
                    Ver historial completo
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<Trash size={14} />}
                    color="red"
                    onClick={openDeleteModal}
                  >
                    Dar de baja
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>

          {/* Profile Header */}
          <Group align="flex-start" gap="lg">
            <Avatar
              src={prisoner.photo}
              alt={prisoner.fullName}
              size={80}
              radius="md"
            >
              <User size={40} />
            </Avatar>

            <Stack gap="xs" style={{ flex: 1 }}>
              <Group gap="md" align="center">
                <Title order={2}>{prisoner.fullName}</Title>
                <Badge
                  color={prisoner.status === "Activo" ? "green" : "gray"}
                  variant="light"
                  size="sm"
                >
                  {prisoner.status}
                </Badge>
              </Group>

              <Group gap="md" c="dimmed">
                <Text size="sm">CI: {prisoner.idNumber}</Text>
                <Text size="sm">Edad: {prisoner.age} años</Text>
                <Text size="sm">Celda: {prisoner.cellBlock}</Text>
              </Group>
            </Stack>
          </Group>
        </Paper>

        {/* Tabs Content */}
        <Paper p="lg" withBorder radius="md" shadow="xs">
          <Tabs defaultValue="general" variant="outline">
            <Tabs.List mb="xl">
              <Tabs.Tab value="general" leftSection={<User size={16} />}>
                Información General
              </Tabs.Tab>
              <Tabs.Tab value="medical" leftSection={<FileText size={16} />}>
                Información Médica
              </Tabs.Tab>
              <Tabs.Tab value="legal" leftSection={<FileText size={16} />}>
                Situación Legal
              </Tabs.Tab>
              <Tabs.Tab value="activity" leftSection={<Activity size={16} />}>
                Actividad
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general">
              <PersonalInfo prisoner={prisoner} />
            </Tabs.Panel>

            <Tabs.Panel value="medical">
              <MedicalInfo prisonerId={prisoner.id} />
            </Tabs.Panel>

            <Tabs.Panel value="legal">
              <LegalStatus prisonerId={prisoner.id} />
            </Tabs.Panel>

            <Tabs.Panel value="activity">
              <ActivityHistory prisonerId={prisoner.id} />
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </Container>
  );
};

export default PrisonerProfilePage;
