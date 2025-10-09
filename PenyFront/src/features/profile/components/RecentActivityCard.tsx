import {
  Paper,
  Title,
  Text,
  Group,
  Button,
  Stack
} from '@mantine/core';

const RecentActivityCard = () => {
  const recentActivities = [
    {
      title: 'Ingresó al sistema',
      time: '2024-01-25 - 09:30',
      color: '#1976d2'
    },
    {
      title: 'Revisó expediente de Juan Pérez',
      time: '2024-01-25 - 08:15',
      color: '#388e3c'
    },
    {
      title: 'Generó reporte mensual',
      time: '2024-01-25 - 08:45',
      color: '#f57c00'
    },
    {
      title: 'Actualizó información de interno',
      time: '2024-01-24 - 16:30',
      color: '#7b1fa2'
    },
    {
      title: 'Realizó búsqueda avanzada',
      time: '2024-01-24 - 15:20',
      color: '#0288d1'
    }
  ];

  return (
    <Paper shadow="sm" p="lg" radius="md">
      <Group justify="space-between" align="center" mb="md">
        <Title order={3} c="dark">Actividad Reciente</Title>
        <Button variant="subtle" size="sm" c="blue">
          Ver toda la actividad →
        </Button>
      </Group>
      
      <Stack gap="sm">
        {recentActivities.map((activity, index) => (
          <Group key={index} gap="sm" py="xs">
            <div style={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              backgroundColor: activity.color
            }} />
            <Stack gap={2} style={{ flex: 1 }}>
              <Text size="sm">{activity.title}</Text>
              <Text size="xs" c="dimmed">{activity.time}</Text>
            </Stack>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
};

export default RecentActivityCard;
