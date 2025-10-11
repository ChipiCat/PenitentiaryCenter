import { 
  Grid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Divider,
  Badge,
  Button,
  ActionIcon,
  Tooltip,
  Avatar,
  Timeline,
  Alert,
  Box,
  Paper,
  Title,
  Anchor
} from '@mantine/core';
import { 
  User, 
  Calendar, 
  Phone, 
  Users,
  Edit,
  Plus,
  MapPin,
  IdCard,
  Clock,
  Home,
  Heart,
  Shield,
  FileText,
  Copy,
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import type { Prisoner } from '../../types';

interface PersonalInfoProps {
  prisoner: Prisoner;
}

export const PersonalInfo = ({ prisoner }: PersonalInfoProps) => {
  const [showFullAddress, setShowFullAddress] = useState(false);

  // 🔧 Función segura para manejar fechas
  const safeDate = (dateValue: string | undefined, fallback: string = '2024-01-01'): Date => {
    if (!dateValue) return new Date(fallback);
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? new Date(fallback) : date;
  };

  // Calcular tiempo en prisión con validación
  const admissionDate = safeDate(prisoner.admissionDate);
  const today = new Date();
  const timeInPrison = Math.floor((today.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
  const monthsInPrison = Math.floor(timeInPrison / 30);
  const daysInPrison = timeInPrison % 30;

  // 🔧 Función para copiar al portapapeles con validación
  const copyToClipboard = (text: string | undefined, label: string) => {
    const safeTxt = text || 'No disponible';
    navigator.clipboard.writeText(safeTxt);
    notifications.show({
      title: 'Copiado',
      message: `${label} copiado al portapapeles`,
      color: 'green',
      autoClose: 2000
    });
  };

  // Datos adicionales del mock
  const additionalData = {
    birthDate: '1990-03-15',
    nationality: prisoner.nationality || 'Boliviana',
    maritalStatus: 'Soltero',
    education: 'Secundaria Completa',
    profession: 'Carpintero',
    bloodType: 'O+',
    birthPlace: 'La Paz, Bolivia'
  };

  // 🔧 Datos del contacto de emergencia corregidos
  const emergencyContact = {
    name: prisoner.emergencyContact || 'No especificado',
    phone: prisoner.emergencyPhone || 'No especificado',
    relationship: prisoner.relationship || 'No especificado',
    address: prisoner.location?.address || 'No especificado'
  };

  // 🔧 Función segura para obtener ID
  const getPrisonerId = () => {
    return prisoner.identification || prisoner.idNumber || 'No especificado';
  };

  // 🔧 Función segura para manejar direcciones
  const getSafeAddress = (address: string) => {
    if (!address || address === 'No especificado') return address;
    return address.length > 50 ? address.substring(0, 50) + '...' : address;
  };

  const shouldShowMoreButton = (address: string) => {
    return address && address !== 'No especificado' && address.length > 50;
  };

  // 🔧 Función segura para formato de género
  const getGenderDisplay = (gender: string | undefined) => {
    if (!gender) return 'No especificado';
    return gender === 'M' ? 'Masculino' : gender === 'F' ? 'Femenino' : gender;
  };

  return (
    <Stack gap="xl">
      {/* Header Card con Avatar y Info Principal */}
      <Card withBorder radius="lg" p="xl" bg="gradient-to-r from-blue-50 to-indigo-50">
        <Group align="flex-start" gap="xl">
          <Avatar
            src={prisoner.photo}
            alt={prisoner.fullName}
            size={120}
            radius="md"
            style={{ 
              border: '4px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <User size={60} />
          </Avatar>

          <Box style={{ flex: 1 }}>
            <Group justify="space-between" align="flex-start" mb="md">
              <div>
                <Title order={2} size="h3" mb="xs">
                  {prisoner.fullName}
                </Title>
                <Group gap="xs" mb="sm">
                  <Badge 
                    size="lg" 
                    color={prisoner.status === 'Activo' ? 'green' : 'gray'}
                    variant="light"
                  >
                    {prisoner.status || 'Activo'}
                  </Badge>
                  <Badge size="lg" variant="outline" color="blue">
                    ID: {getPrisonerId()}
                  </Badge>
                </Group>
                <Group gap="md" c="dimmed">
                  <Group gap="xs">
                    <Calendar size={16} />
                    <Text size="sm">{prisoner.age} años</Text>
                  </Group>
                  <Group gap="xs">
                    <Home size={16} />
                    <Text size="sm">{prisoner.cellBlock || 'Sin asignar'}</Text>
                  </Group>
                  <Group gap="xs">
                    <Clock size={16} />
                    <Text size="sm">{monthsInPrison} meses en prisión</Text>
                  </Group>
                </Group>
              </div>

              <Tooltip label="Editar información personal">
                <ActionIcon variant="light" size="lg" color="blue">
                  <Edit size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {/* Quick Stats */}
            <Grid>
              <Grid.Col span={4}>
                <Paper p="md" radius="md" bg="white" withBorder>
                  <Stack gap="xs" align="center">
                    <Text size="xl" fw={700} c="blue">{timeInPrison}</Text>
                    <Text size="xs" c="dimmed" ta="center">Días en prisión</Text>
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={4}>
                <Paper p="md" radius="md" bg="white" withBorder>
                  <Stack gap="xs" align="center">
                    <Text size="xl" fw={700} c="green">
                      {emergencyContact.name !== 'No especificado' ? '1' : '0'}
                    </Text>
                    <Text size="xs" c="dimmed" ta="center">Contactos de emergencia</Text>
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={4}>
                <Paper p="md" radius="md" bg="white" withBorder>
                  <Stack gap="xs" align="center">
                    <Text size="xl" fw={700} c="orange">{additionalData.bloodType}</Text>
                    <Text size="xs" c="dimmed" ta="center">Tipo de sangre</Text>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Box>
        </Group>
      </Card>

      <Grid>
        {/* Información Personal Detallada */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder padding="lg" radius="md">
            <Group justify="space-between" mb="lg">
              <Group>
                <ThemeIcon size="lg" variant="light" color="blue" radius="md">
                  <IdCard size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="lg">Información Personal</Text>
                  <Text size="sm" c="dimmed">Datos personales y documentación</Text>
                </div>
              </Group>
              <ActionIcon variant="subtle" size="lg">
                <Edit size={18} />
              </ActionIcon>
            </Group>

            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group justify="space-between" align="center">
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed" fw={500}>Nombre Completo</Text>
                    <Text fw={600}>{prisoner.fullName}</Text>
                  </Stack>
                  <ActionIcon 
                    variant="subtle" 
                    size="sm"
                    onClick={() => copyToClipboard(prisoner.fullName, 'Nombre')}
                  >
                    <Copy size={14} />
                  </ActionIcon>
                </Group>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group justify="space-between" align="center">
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed" fw={500}>Cédula de Identidad</Text>
                    <Text fw={600}>{getPrisonerId()}</Text>
                  </Stack>
                  <ActionIcon 
                    variant="subtle" 
                    size="sm"
                    onClick={() => copyToClipboard(getPrisonerId(), 'CI')}
                  >
                    <Copy size={14} />
                  </ActionIcon>
                </Group>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>Fecha de Nacimiento</Text>
                  <Text fw={600}>{safeDate(additionalData.birthDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>Edad</Text>
                  <Badge size="lg" variant="light" color="blue">
                    {prisoner.age} años
                  </Badge>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>Género</Text>
                  <Text fw={600}>{getGenderDisplay(prisoner.gender)}</Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>Nacionalidad</Text>
                  <Group gap="xs">
                    <Globe size={16} color="var(--mantine-color-dimmed)" />
                    <Text fw={600}>{additionalData.nationality}</Text>
                  </Group>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>Estado Civil</Text>
                  <Text fw={600}>{additionalData.maritalStatus}</Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>Nivel Educativo</Text>
                  <Text fw={600}>{additionalData.education}</Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>Profesión/Oficio</Text>
                  <Text fw={600}>{additionalData.profession}</Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>Lugar de Nacimiento</Text>
                  <Group gap="xs">
                    <MapPin size={16} color="var(--mantine-color-dimmed)" />
                    <Text fw={600}>{additionalData.birthPlace}</Text>
                  </Group>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>

        {/* Sidebar con información adicional */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md">
            {/* Ubicación Actual */}
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between" mb="md">
                <Group>
                  <ThemeIcon size="md" variant="light" color="orange" radius="md">
                    <Home size={16} />
                  </ThemeIcon>
                  <Text fw={600}>Ubicación Actual</Text>
                </Group>
              </Group>

              <Stack gap="md">
                <Box>
                  <Text size="sm" c="dimmed" mb="xs">Celda/Pabellón</Text>
                  <Badge size="xl" variant="light" color="orange" fullWidth>
                    {prisoner.cellBlock || 'Sin asignar'}
                  </Badge>
                </Box>

                <Divider />

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Fecha de Ingreso</Text>
                  <Text fw={500} size="sm">
                    {/* 🔧 Usar función segura para fechas */}
                    {safeDate(prisoner.admissionDate).toLocaleDateString()}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Tiempo en prisión</Text>
                  <Text fw={500} size="sm" c="blue">
                    {monthsInPrison}m {daysInPrison}d
                  </Text>
                </Group>
              </Stack>
            </Card>

            {/* Información Médica Básica */}
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between" mb="md">
                <Group>
                  <ThemeIcon size="md" variant="light" color="red" radius="md">
                    <Heart size={16} />
                  </ThemeIcon>
                  <Text fw={600}>Información Médica</Text>
                </Group>
              </Group>

              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Tipo de Sangre</Text>
                  <Badge color="red" variant="light">
                    {additionalData.bloodType}
                  </Badge>
                </Group>

                <Alert color="blue" variant="light">
                  <Text size="sm">
                    Ver información médica completa en la pestaña correspondiente
                  </Text>
                </Alert>
              </Stack>
            </Card>

            {/* Timeline de Eventos Recientes */}
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between" mb="md">
                <Group>
                  <ThemeIcon size="md" variant="light" color="green" radius="md">
                    <Clock size={16} />
                  </ThemeIcon>
                  <Text fw={600}>Eventos Recientes</Text>
                </Group>
              </Group>

              <Timeline bulletSize={20} lineWidth={2}>
                <Timeline.Item
                  bullet={<Calendar size={10} />}
                  title="Ingreso al centro"
                  color="blue"
                >
                  <Text c="dimmed" size="sm">
                    {/* 🔧 Usar función segura para fechas */}
                    {safeDate(prisoner.admissionDate).toLocaleDateString()}
                  </Text>
                </Timeline.Item>
                
                <Timeline.Item
                  bullet={<FileText size={10} />}
                  title="Última actualización"
                  color="green"
                >
                  <Text c="dimmed" size="sm">
                    {/* 🔧 Usar función segura para fechas */}
                    {safeDate(prisoner.lastUpdate).toLocaleDateString()}
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Contactos de Emergencia Mejorado */}
      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" mb="lg">
          <Group>
            <ThemeIcon size="lg" variant="light" color="red" radius="md">
              <Users size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">Contactos de Emergencia</Text>
              <Text size="sm" c="dimmed">Personas de contacto en caso de emergencia</Text>
            </div>
          </Group>
          <Button variant="light" leftSection={<Plus size={16} />}>
            Agregar Contacto
          </Button>
        </Group>

        {/* Verificar si hay contacto de emergencia */}
        {emergencyContact.name !== 'No especificado' ? (
          <Card withBorder p="lg" bg="red.0" radius="md">
            <Group justify="space-between" align="flex-start">
              <Group align="flex-start">
                <Avatar size="md" radius="md" color="red">
                  <User size={20} />
                </Avatar>
                
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Text fw={600} size="lg">{emergencyContact.name}</Text>
                    <Badge variant="outline" color="red">
                      {emergencyContact.relationship}
                    </Badge>
                  </Group>
                  
                  <Stack gap="sm">
                    {/* Teléfono */}
                    {emergencyContact.phone !== 'No especificado' && (
                      <Group gap="xs">
                        <Phone size={16} color="var(--mantine-color-dimmed)" />
                        <Anchor href={`tel:${emergencyContact.phone}`} c="blue">
                          {emergencyContact.phone}
                        </Anchor>
                        <ActionIcon 
                          variant="subtle" 
                          size="sm"
                          onClick={() => copyToClipboard(emergencyContact.phone, 'Teléfono')}
                        >
                          <Copy size={12} />
                        </ActionIcon>
                      </Group>
                    )}
                    
                    {/* Dirección */}
                    {emergencyContact.address !== 'No especificado' && (
                      <Group gap="xs" align="flex-start">
                        <MapPin size={16} color="var(--mantine-color-dimmed)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" c="dimmed">
                            {showFullAddress 
                              ? emergencyContact.address 
                              : getSafeAddress(emergencyContact.address)
                            }
                            {shouldShowMoreButton(emergencyContact.address) && (
                              <Anchor 
                                size="sm" 
                                ml="xs"
                                onClick={() => setShowFullAddress(!showFullAddress)}
                              >
                                {showFullAddress ? 'Ver menos' : 'Ver más'}
                              </Anchor>
                            )}
                          </Text>
                        </Box>
                      </Group>
                    )}
                  </Stack>
                </Stack>
              </Group>

              <Group gap="xs">
                {emergencyContact.phone !== 'No especificado' && (
                  <Tooltip label="Llamar">
                    <ActionIcon variant="light" color="green" size="lg">
                      <Phone size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="Editar contacto">
                  <ActionIcon variant="light" color="blue" size="lg">
                    <Edit size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Card>
        ) : (
          <Alert color="orange" variant="light">
            <Group justify="space-between" align="center">
              <Text size="sm">
                No hay contactos de emergencia registrados para este recluso.
              </Text>
              <Button variant="light" size="sm" leftSection={<Plus size={14} />}>
                Agregar Contacto
              </Button>
            </Group>
          </Alert>
        )}
      </Card>

      {/* Información de Actualización */}
      <Paper p="md" radius="md" bg="gray.1">
        <Group justify="space-between">
          <Group gap="xs">
            <Shield size={16} color="var(--mantine-color-dimmed)" />
            <Text size="sm" c="dimmed">
              Última actualización: {safeDate(prisoner.lastUpdate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </Group>
          <Button variant="subtle" size="sm" leftSection={<FileText size={14} />}>
            Ver historial de cambios
          </Button>
        </Group>
      </Paper>
    </Stack>
  );
};