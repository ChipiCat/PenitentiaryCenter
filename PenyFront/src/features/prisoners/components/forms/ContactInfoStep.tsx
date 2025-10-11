import { 
  TextInput, 
  Select, 
  Autocomplete,  // 🆕 Importar Autocomplete
  Stack, 
  Grid,
  Title,
  Textarea,
  Card,
  Text,
  Group,
  ThemeIcon,
  Alert,
  Divider
} from '@mantine/core';
import { 
  Phone, 
  User, 
  MapPin, 
  Home,
  Users,
  AlertCircle,
  Info
} from 'lucide-react';
import type { FormStepProps, ContactInfo } from '../../types';

const relationshipOptions = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'esposo', label: 'Esposo/a' },
  { value: 'hijo', label: 'Hijo/a' },
  { value: 'hermano', label: 'Hermano/a' },
  { value: 'abuelo', label: 'Abuelo/a' },
  { value: 'tio', label: 'Tío/a' },
  { value: 'primo', label: 'Primo/a' },
  { value: 'amigo', label: 'Amigo/a' },
  { value: 'tutor', label: 'Tutor Legal' },
  { value: 'abogado', label: 'Abogado' },
  { value: 'otro', label: 'Otro' }
];

// 🆕 Departamentos de Bolivia
const departmentOptions = [
  { value: 'la_paz', label: 'La Paz' },
  { value: 'cochabamba', label: 'Cochabamba' },
  { value: 'santa_cruz', label: 'Santa Cruz' },
  { value: 'potosi', label: 'Potosí' },
  { value: 'chuquisaca', label: 'Chuquisaca' },
  { value: 'tarija', label: 'Tarija' },
  { value: 'oruro', label: 'Oruro' },
  { value: 'beni', label: 'Beni' },
  { value: 'pando', label: 'Pando' }
];

// Ciudades principales por departamento
const cityOptions: Record<string, string[]> = {
  la_paz: ['La Paz', 'El Alto', 'Viacha', 'Achocalla', 'Mecapaca'],
  cochabamba: ['Cochabamba', 'Quillacollo', 'Sacaba', 'Colcapirhua', 'Tiquipaya'],
  santa_cruz: ['Santa Cruz de la Sierra', 'Montero', 'Warnes', 'La Guardia', 'Cotoca'],
  potosi: ['Potosí', 'Llallagua', 'Tupiza', 'Uyuni', 'Villazón'],
  chuquisaca: ['Sucre', 'Monteagudo', 'Tarabuco', 'Yamparáez', 'Camargo'],
  tarija: ['Tarija', 'Yacuiba', 'Villamontes', 'Bermejo', 'Padcaya'],
  oruro: ['Oruro', 'Llallagua', 'Machacamarca', 'Challapata', 'Huanuni'],
  beni: ['Trinidad', 'Riberalta', 'Guayaramerín', 'San Borja', 'Santa Ana del Yacuma'],
  pando: ['Cobija', 'Porvenir', 'Bella Flor', 'Filadelfia', 'Puerto Rico']
};

export const ContactInfoStep = ({ data, onUpdate }: FormStepProps<ContactInfo>) => {
  const validateStep = () => {
    const warnings = [];
    
    if (!data.emergencyContact) {
      warnings.push('Se recomienda agregar un contacto de emergencia');
    }
    
    if (data.emergencyContact && !data.emergencyPhone) {
      warnings.push('Se recomienda agregar el teléfono del contacto de emergencia');
    }

    return { warnings, isValid: true }; // Contacto es opcional
  };

  const { warnings } = validateStep();

  // Obtener ciudades del departamento seleccionado
  const availableCities = data.department ? cityOptions[data.department] || [] : [];

  return (
    <Stack gap="lg">
      <Group gap="md" mb="md">
        <ThemeIcon size="lg" variant="light" color="green">
          <Phone size={20} />
        </ThemeIcon>
        <div>
          <Title order={3} size="h4">
            Información de Contacto
          </Title>
          <Text size="sm" c="dimmed">
            Contactos de emergencia y ubicación (opcional)
          </Text>
        </div>
      </Group>

      {/* Alert informativo */}
      <Alert
        icon={<Info size={16} />}
        title="Información opcional"
        color="blue"
        variant="light"
      >
        Esta información es opcional pero recomendada para mantener contacto 
        con familiares en caso de emergencia.
      </Alert>

      {/* Warnings si existen */}
      {warnings.length > 0 && (
        <Alert
          icon={<AlertCircle size={16} />}
          title="Recomendaciones"
          color="yellow"
          variant="light"
        >
          <Stack gap="xs">
            {warnings.map((warning, index) => (
              <Text key={index} size="sm">• {warning}</Text>
            ))}
          </Stack>
        </Alert>
      )}

      {/* Contacto de Emergencia */}
      <Card withBorder padding="lg">
        <Group mb="md">
          <ThemeIcon size="sm" variant="light" color="red">
            <Users size={14} />
          </ThemeIcon>
          <Text fw={500} size="sm">Contacto de Emergencia</Text>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Nombre Completo"
              placeholder="Nombre del contacto de emergencia"
              value={data.emergencyContact}
              onChange={(e) => onUpdate({ emergencyContact: e.currentTarget.value })}
              leftSection={<User size={16} />}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Teléfono de Emergencia"
              placeholder="Ej: +591 70123456"
              value={data.emergencyPhone}
              onChange={(e) => onUpdate({ emergencyPhone: e.currentTarget.value })}
              leftSection={<Phone size={16} />}
              description="Incluya código de país (+591 para Bolivia)"
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Select
              label="Relación con el Interno"
              placeholder="¿Qué relación tiene con el interno?"
              data={relationshipOptions}
              value={data.relationship}
              onChange={(value) => onUpdate({ relationship: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>
        </Grid>
      </Card>

      <Divider />

      {/* Información de Ubicación */}
      <Card withBorder padding="lg">
        <Group mb="md">
          <ThemeIcon size="sm" variant="light" color="blue">
            <MapPin size={14} />
          </ThemeIcon>
          <Text fw={500} size="sm">Ubicación del Contacto</Text>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Departamento"
              placeholder="Seleccione el departamento"
              data={departmentOptions}
              value={data.department}
              onChange={(value) => {
                onUpdate({ 
                  department: value || '',
                  city: '' // Limpiar ciudad cuando cambie departamento
                });
              }}
              searchable
              clearable
              leftSection={<MapPin size={16} />}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            {/* 🆕 Usar Autocomplete en lugar de Select */}
            <Autocomplete
              label="Ciudad"
              placeholder={data.department ? "Seleccione o escriba la ciudad" : "Primero seleccione un departamento"}
              data={availableCities}
              value={data.city}
              onChange={(value) => onUpdate({ city: value })}
              disabled={!data.department}
              leftSection={<Home size={16} />}
              description="Seleccione de la lista o escriba el nombre de la ciudad"
              limit={10}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Textarea
              label="Dirección Completa"
              placeholder="Ingrese la dirección completa del contacto de emergencia"
              minRows={3}
              maxRows={5}
              value={data.address}
              onChange={(e) => onUpdate({ address: e.currentTarget.value })}
              description="Incluya zona, calle, número de casa y referencias"
            />
          </Grid.Col>
        </Grid>
      </Card>

      {/* Información adicional si hay datos completos */}
      {data.emergencyContact && data.emergencyPhone && data.department && (
        <Alert
          icon={<Info size={16} />}
          title="Información de contacto registrada"
          color="green"
          variant="light"
        >
          <Text size="sm">
            <strong>{data.emergencyContact}</strong> 
            {data.relationship && ` (${relationshipOptions.find(r => r.value === data.relationship)?.label})`}
            <br />
            📞 {data.emergencyPhone}
            <br />
            📍 {data.city && `${data.city}, `}
            {departmentOptions.find(d => d.value === data.department)?.label}
          </Text>
        </Alert>
      )}
    </Stack>
  );
};