import { 
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Badge,
  Grid,
  Alert,
  Button,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { 
  Heart,
  Pill,
  AlertTriangle,
  Plus,
  Edit,
  Activity
} from 'lucide-react';
import { useMemo } from 'react';

interface MedicalInfoProps {
  prisonerId: string;
}

export const MedicalInfo = ({ prisonerId }: MedicalInfoProps) => {
  // 🔧 Mock data que usa el prisonerId para generar datos específicos
  const medicalData = useMemo(() => ({
    patientId: prisonerId, // 🆕 Incluir el ID del paciente
    bloodType: 'O+',
    allergies: ['Penicilina', 'Mariscos'],
    chronicConditions: ['Diabetes Tipo 2', 'Hipertensión'],
    currentMedications: [
      { 
        id: `${prisonerId}-med-1`, // 🆕 ID único basado en prisonerId
        name: 'Metformina', 
        dose: '500mg', 
        frequency: '2 veces al día',
        prescribedDate: '2024-01-01'
      },
      { 
        id: `${prisonerId}-med-2`, // 🆕 ID único basado en prisonerId
        name: 'Losartán', 
        dose: '50mg', 
        frequency: '1 vez al día',
        prescribedDate: '2024-01-05'
      }
    ],
    lastCheckup: '2024-01-15',
    nextCheckup: '2024-04-15',
    vaccinations: [
      { 
        id: `${prisonerId}-vac-1`, // 🆕 ID único basado en prisonerId
        name: 'COVID-19', 
        date: '2023-12-01', 
        nextDue: '2024-12-01' 
      },
      { 
        id: `${prisonerId}-vac-2`, // 🆕 ID único basado en prisonerId
        name: 'Influenza', 
        date: '2023-10-15', 
        nextDue: '2024-10-15' 
      }
    ],
    medicalRecordNumber: `MED-${prisonerId}` // 🆕 Número de expediente médico
  }), [prisonerId]); // 🆕 Dependencia del prisonerId

  return (
    <Stack gap="lg">
      {/* Información Médica General */}
      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <ThemeIcon size="sm" variant="light" color="red">
              <Heart size={14} />
            </ThemeIcon>
            <Text fw={500}>
              Información Médica General
              {/* 🆕 Mostrar información del paciente */}
              <Text component="span" size="sm" c="dimmed" ml="xs">
                (Expediente: {medicalData.medicalRecordNumber})
              </Text>
            </Text>
          </Group>
          <Tooltip label="Editar información médica">
            <ActionIcon 
              variant="subtle" 
              size="sm"
              onClick={() => {
                // 🆕 Usar prisonerId en la acción
                console.log(`Editing medical info for prisoner ${prisonerId}`);
              }}
            >
              <Edit size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">ID del Paciente</Text>
              <Badge variant="light" color="gray">
                {medicalData.patientId}
              </Badge>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Tipo de Sangre</Text>
              <Badge variant="light" color="red" size="lg">
                {medicalData.bloodType}
              </Badge>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Último Chequeo</Text>
              <Text fw={500}>{new Date(medicalData.lastCheckup).toLocaleDateString()}</Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Próximo Chequeo</Text>
              <Text fw={500} c="blue">{new Date(medicalData.nextCheckup).toLocaleDateString()}</Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>

      <Grid>
        {/* Condiciones Médicas */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" h="100%">
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon size="sm" variant="light" color="orange">
                  <AlertTriangle size={14} />
                </ThemeIcon>
                <Text fw={500}>Condiciones Médicas</Text>
              </Group>
              <ActionIcon 
                variant="subtle" 
                size="sm"
                onClick={() => {
                  // 🆕 Usar prisonerId en la acción
                  console.log(`Adding medical condition for prisoner ${prisonerId}`);
                }}
              >
                <Plus size={14} />
              </ActionIcon>
            </Group>

            <Stack gap="md">
              <div>
                <Text size="sm" c="dimmed" mb="xs">Alergias</Text>
                <Group gap="xs">
                  {medicalData.allergies.map((allergy, index) => (
                    <Badge key={index} color="red" variant="light">
                      {allergy}
                    </Badge>
                  ))}
                  {medicalData.allergies.length === 0 && (
                    <Text size="sm" c="dimmed">Sin alergias conocidas</Text>
                  )}
                </Group>
              </div>

              <div>
                <Text size="sm" c="dimmed" mb="xs">Condiciones Crónicas</Text>
                <Group gap="xs">
                  {medicalData.chronicConditions.map((condition, index) => (
                    <Badge key={index} color="yellow" variant="light">
                      {condition}
                    </Badge>
                  ))}
                  {medicalData.chronicConditions.length === 0 && (
                    <Text size="sm" c="dimmed">Sin condiciones crónicas</Text>
                  )}
                </Group>
              </div>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Medicamentos Actuales */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" h="100%">
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon size="sm" variant="light" color="blue">
                  <Pill size={14} />
                </ThemeIcon>
                <Text fw={500}>Medicamentos Actuales</Text>
              </Group>
              <ActionIcon 
                variant="subtle" 
                size="sm"
                onClick={() => {
                  // 🆕 Usar prisonerId en la acción
                  console.log(`Adding medication for prisoner ${prisonerId}`);
                }}
              >
                <Plus size={14} />
              </ActionIcon>
            </Group>

            <Stack gap="md">
              {medicalData.currentMedications.length > 0 ? (
                medicalData.currentMedications.map((medication) => (
                  <Card key={medication.id} withBorder p="sm" bg="gray.0">
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text fw={500} size="sm">{medication.name}</Text>
                        <Text size="xs" c="dimmed">ID: {medication.id}</Text>
                      </Group>
                      <Group gap="md">
                        <Text size="xs" c="dimmed">Dosis: {medication.dose}</Text>
                        <Text size="xs" c="dimmed">Frecuencia: {medication.frequency}</Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        Prescrito: {new Date(medication.prescribedDate).toLocaleDateString()}
                      </Text>
                    </Stack>
                  </Card>
                ))
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  No hay medicamentos registrados para el paciente {prisonerId}
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Vacunas */}
      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <ThemeIcon size="sm" variant="light" color="green">
              <Activity size={14} />
            </ThemeIcon>
            <Text fw={500}>Historial de Vacunas</Text>
          </Group>
          <Button 
            variant="light" 
            leftSection={<Plus size={14} />} 
            size="sm"
            onClick={() => {
              // 🆕 Usar prisonerId en la acción
              console.log(`Registering vaccine for prisoner ${prisonerId}`);
            }}
          >
            Registrar Vacuna
          </Button>
        </Group>

        {medicalData.vaccinations.length > 0 ? (
          <Grid>
            {medicalData.vaccinations.map((vaccine) => (
              <Grid.Col key={vaccine.id} span={{ base: 12, md: 6 }}>
                <Card withBorder p="md" bg="green.0">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap="xs">
                      <Text fw={500}>{vaccine.name}</Text>
                      <Text size="xs" c="dimmed">ID: {vaccine.id}</Text>
                      <Text size="sm" c="dimmed">
                        Aplicada: {new Date(vaccine.date).toLocaleDateString()}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Próxima: {new Date(vaccine.nextDue).toLocaleDateString()}
                      </Text>
                    </Stack>
                    <Badge color="green" variant="light">Activa</Badge>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No hay vacunas registradas para el paciente {prisonerId}
          </Text>
        )}
      </Card>

      {/* Alertas médicas */}
      <Alert color="orange" title="Recordatorio">
        El próximo chequeo médico para el paciente <strong>{prisonerId}</strong> está programado para el {new Date(medicalData.nextCheckup).toLocaleDateString()}.
      </Alert>

      {/* 🆕 Información adicional específica del paciente */}
      <Card withBorder padding="md" bg="blue.0">
        <Group>
          <ThemeIcon size="sm" variant="light" color="blue">
            <Heart size={14} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="sm" fw={500}>
              Expediente Médico: {medicalData.medicalRecordNumber}
            </Text>
            <Text size="xs" c="dimmed">
              Paciente ID: {prisonerId} | Última actualización: {new Date().toLocaleDateString()}
            </Text>
          </Stack>
        </Group>
      </Card>
    </Stack>
  );
};