import {
  Paper,
  Title,
  Text,
  Group,
  Stack
} from '@mantine/core';
import { Calendar, Activity } from 'lucide-react';

const UsageStatsCard = () => {
  return (
    <Paper shadow="sm" p="lg" radius="md">
      <Title order={3} c="dark" mb="md">Estadísticas de Uso</Title>
      
      <Stack gap="md">
        <Group justify="space-between" p="sm" style={{ backgroundColor: '#f8f9ff', borderRadius: '8px' }}>
          <Group gap="sm">
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '6px', 
              backgroundColor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={16} color="#1976d2" />
            </div>
            <Stack gap={2}>
              <Text size="sm" fw={500}>Total de Sesiones</Text>
              <Text size="xs" c="dimmed">Histórico completo</Text>
            </Stack>
          </Group>
          <Text size="xl" fw={700} c="blue">847</Text>
        </Group>

        <Group justify="space-between" p="sm" style={{ backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
          <Group gap="sm">
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '6px', 
              backgroundColor: '#c8e6c9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={16} color="#388e3c" />
            </div>
            <Stack gap={2}>
              <Text size="sm" fw={500}>Acciones Hoy</Text>
              <Text size="xs" c="dimmed">Actividad del día</Text>
            </Stack>
          </Group>
          <Text size="xl" fw={700} c="green">12</Text>
        </Group>
      </Stack>
    </Paper>
  );
};

export default UsageStatsCard;
