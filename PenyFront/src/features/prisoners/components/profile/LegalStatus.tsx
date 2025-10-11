import { 
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Badge,
  Grid,
  Timeline,
  Button,
  ActionIcon,
  Tooltip,
  Progress
} from '@mantine/core';
import { 
  Scale,
  Calendar,
  Clock,
  User,
  Building,
  Plus,
  Edit
} from 'lucide-react';
import { useMemo } from 'react';

interface LegalStatusProps {
  prisonerId: string;
}

export const LegalStatus = ({ prisonerId }: LegalStatusProps) => {
  // 🔧 Mock data que usa el prisonerId para generar datos específicos
  const legalData = useMemo(() => ({
    case: {
      number: `CASO-2024-${prisonerId.slice(-3).padStart(3, '0')}`, // 🆕 Usar prisonerId
      crime: 'Robo agravado',
      sentence: '5 años',
      startDate: '2024-01-15',
      endDate: '2029-01-15',
      status: 'En proceso'
    },
    lawyer: {
      name: 'Dr. Miguel Hernández',
      phone: '+591 70123456',
      email: 'mhernandez@abogados.bo'
    },
    court: {
      name: 'Tribunal Penal 1',
      judge: 'Dra. Ana López',
      location: 'La Paz, Bolivia'
    },
    timeline: [
      { 
        date: '2024-01-15', 
        event: `Ingreso al centro penitenciario (ID: ${prisonerId})`, // 🆕 Usar prisonerId
        status: 'completed' 
      },
      { date: '2024-02-01', event: 'Primera audiencia', status: 'completed' },
      { date: '2024-03-15', event: 'Evaluación psicológica', status: 'completed' },
      { date: '2024-04-20', event: 'Próxima audiencia', status: 'upcoming' }
    ]
  }), [prisonerId]); // 🆕 Dependencia del prisonerId

  // Calcular progreso de la condena
  const startDate = new Date(legalData.case.startDate);
  const endDate = new Date(legalData.case.endDate);
  const currentDate = new Date();
  const totalTime = endDate.getTime() - startDate.getTime();
  const timeServed = currentDate.getTime() - startDate.getTime();
  const progress = Math.max(0, Math.min(100, (timeServed / totalTime) * 100));

  return (
    <Stack gap="lg">
      {/* Información del Caso */}
      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <ThemeIcon size="sm" variant="light" color="blue">
              <Scale size={14} />
            </ThemeIcon>
            <Text fw={500}>
              Información del Caso
              {/* 🆕 Mostrar ID del recluso */}
              <Text component="span" size="sm" c="dimmed" ml="xs">
                (Recluso: {prisonerId})
              </Text>
            </Text>
          </Group>
          <Tooltip label="Editar información legal">
            <ActionIcon variant="subtle" size="sm">
              <Edit size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Número de Caso</Text>
              <Text fw={500}>{legalData.case.number}</Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Delito</Text>
              <Text fw={500}>{legalData.case.crime}</Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Condena</Text>
              <Badge color="orange" variant="light" size="lg">
                {legalData.case.sentence}
              </Badge>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Estado</Text>
              <Badge 
                color={legalData.case.status === 'En proceso' ? 'yellow' : 'green'} 
                variant="light"
              >
                {legalData.case.status}
              </Badge>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Progreso de la condena */}
        <Stack gap="xs" mt="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Progreso de la condena</Text>
            <Text size="sm" fw={500}>{Math.round(progress)}%</Text>
          </Group>
          <Progress value={progress} color="blue" size="lg" />
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Inicio: {new Date(legalData.case.startDate).toLocaleDateString()}
            </Text>
            <Text size="xs" c="dimmed">
              Fin: {new Date(legalData.case.endDate).toLocaleDateString()}
            </Text>
          </Group>
        </Stack>
      </Card>

      <Grid>
        {/* Representación Legal */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" h="100%">
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon size="sm" variant="light" color="green">
                  <User size={14} />
                </ThemeIcon>
                <Text fw={500}>Representación Legal</Text>
              </Group>
              <ActionIcon variant="subtle" size="sm">
                <Edit size={14} />
              </ActionIcon>
            </Group>

            <Stack gap="md">
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Abogado</Text>
                <Text fw={500}>{legalData.lawyer.name}</Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">Teléfono</Text>
                <Text fw={500}>{legalData.lawyer.phone}</Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">Email</Text>
                <Text fw={500}>{legalData.lawyer.email}</Text>
              </Stack>

              <Button 
                variant="light" 
                fullWidth
                onClick={() => {
                  // 🆕 Usar prisonerId en la acción
                  console.log(`Contacting lawyer for prisoner ${prisonerId}`);
                }}
              >
                Contactar Abogado
              </Button>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Información del Tribunal */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" h="100%">
            <Group mb="md">
              <ThemeIcon size="sm" variant="light" color="purple">
                <Building size={14} />
              </ThemeIcon>
              <Text fw={500}>Información del Tribunal</Text>
            </Group>

            <Stack gap="md">
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Tribunal</Text>
                <Text fw={500}>{legalData.court.name}</Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">Juez</Text>
                <Text fw={500}>{legalData.court.judge}</Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">Ubicación</Text>
                <Text fw={500}>{legalData.court.location}</Text>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Cronología Legal */}
      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <ThemeIcon size="sm" variant="light" color="orange">
              <Clock size={14} />
            </ThemeIcon>
            <Text fw={500}>Cronología del Proceso</Text>
          </Group>
          <Button 
            variant="light" 
            leftSection={<Plus size={14} />} 
            size="sm"
            onClick={() => {
              // 🆕 Usar prisonerId en la acción
              console.log(`Adding legal event for prisoner ${prisonerId}`);
            }}
          >
            Agregar Evento
          </Button>
        </Group>

        <Timeline bulletSize={24} lineWidth={2}>
          {legalData.timeline.map((item, index) => (
            <Timeline.Item
              key={index}
              bullet={
                item.status === 'completed' ? (
                  <Calendar size={12} />
                ) : (
                  <Clock size={12} />
                )
              }
              title={item.event}
              color={item.status === 'completed' ? 'green' : 'blue'}
            >
              <Text c="dimmed" size="sm">
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </Stack>
  );
};