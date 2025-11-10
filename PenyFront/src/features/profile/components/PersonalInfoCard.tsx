import {
  Paper,
  Title,
  Text,
  Group,
  Avatar,
  Button,
  Grid,
  Stack,
  Skeleton,
} from '@mantine/core';
import { useState } from 'react';
import { useGlobalContext } from '../../../shared/hooks/useGlobalContext';
import { getRoleLabel } from '../../../shared/utils/userUtils';
import { Edit } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import api from '../../../shared/services/api';

const PersonalInfoCard = () => {
  const { user, refetchUser } = useGlobalContext();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const generateUsername = (email: string | undefined) => {
    if (!email) return '@usuario';
    return `@${email.split('@')[0]}`;
  };

  const handleUpdateProfile = async (data: Record<string, string>) => {
    try {
      setIsLoading(true);
      if (!user?.id) throw new Error("User ID not found");
      
      await api.patch(`/users/${user.id}`, data);
      await refetchUser();
      setEditModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Paper shadow="sm" p="lg" radius="md" h="100%">
        <Skeleton height={200} />
      </Paper>
    );
  }

  return (
    <Paper shadow="sm" p="lg" radius="md" h="100%">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Title order={3} c="dark">Información Personal</Title>
        <Button 
          variant="filled" 
          color="dark" 
          size="sm" 
          leftSection={<Edit size={16} />}
          onClick={() => setEditModalOpen(true)}
        >
          Editar
        </Button>
      </Group>

      <Group gap="lg" align="flex-start" mb="xl">
        <Avatar
          src={user?.photoFile?.url || undefined}
          size={80}
          radius="md"
          color="blue"
        >
          {getInitials(user?.name)}
        </Avatar>
        
        <Stack gap="xs">
          <Title order={2} c="dark">{user?.name || 'Usuario'}</Title>
          <Text c="dimmed" size="sm">{getRoleLabel(user?.role ?? "")}</Text>
          <Text c="dimmed" size="sm">{generateUsername(user?.email)}</Text>
        </Stack>
      </Group>

      <Grid gutter="md">
        <Grid.Col span={6}>
          <Text size="sm" fw={500} c="dimmed" mb={4}>Nombre Completo</Text>
          <Text size="sm">{user?.name || 'No disponible'}</Text>
        </Grid.Col>
        
        <Grid.Col span={6}>
          <Text size="sm" fw={500} c="dimmed" mb={4}>Correo Electrónico</Text>
          <Text size="sm">{user?.email || 'No disponible'}</Text>
        </Grid.Col>

        <Grid.Col span={6}>
          <Text size="sm" fw={500} c="dimmed" mb={4}>Rol del Usuario</Text>
          <Text size="sm">{getRoleLabel(user?.role ?? "")}</Text>
        </Grid.Col>

        <Grid.Col span={6}>
          <Text size="sm" fw={500} c="dimmed" mb={4}>Fecha de Registro</Text>
          <Text size="sm">{formatDate(user?.createdAt)}</Text>
        </Grid.Col>

        <Grid.Col span={6}>
          <Text size="sm" fw={500} c="dimmed" mb={4}>Última Actualización</Text>
          <Text size="sm">{formatDateTime(user?.updatedAt)}</Text>
        </Grid.Col>

        <Grid.Col span={6}>
          <Text size="sm" fw={500} c="dimmed" mb={4}>Celular</Text>
          <Text size="sm">{user?.cellphone || 'No disponible'}</Text>
        </Grid.Col>

        <Grid.Col span={6}>
          <Text size="sm" fw={500} c="dimmed" mb={4}>CI</Text>
          <Text size="sm">{user?.ci || 'No disponible'}</Text>
        </Grid.Col>

        <Grid.Col span={6}>
          <Text size="sm" fw={500} c="dimmed" mb={4}>Departamento</Text>
          <Text size="sm">{user?.department || 'No disponible'}</Text>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="sm" fw={500} c="dimmed" mb={4}>Unidad/Dirección Departamental</Text>
          <Text size="sm">{user?.departmentalDirectorateUnit || 'No disponible'}</Text>
        </Grid.Col>
      </Grid>

      <EditProfileModal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        onSubmit={handleUpdateProfile}
        isLoading={isLoading}
      />
    </Paper>
  );
};

export default PersonalInfoCard;