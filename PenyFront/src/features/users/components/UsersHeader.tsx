import { Group, Title, Text, Button } from '@mantine/core';
import { UserPlus } from 'lucide-react';

interface UsersHeaderProps {
  onNewUser: () => void;
}

export const UsersHeader = ({ onNewUser }: UsersHeaderProps) => {
  return (
    <Group justify="space-between">
      <div>
        <Title order={2}>Gestión de Usuarios</Title>
        <Text c="dimmed" size="sm">
          Administra los usuarios del sistema penitenciario
        </Text>
      </div>
      <Button
        leftSection={<UserPlus size={16} />}
        onClick={onNewUser}
        color="dark"
      >
        Nuevo Usuario
      </Button>
    </Group>
  );
};