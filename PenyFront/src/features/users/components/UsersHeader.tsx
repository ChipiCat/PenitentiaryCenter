import { useState } from 'react';
import { Group, Title, Text, Button } from '@mantine/core';
import { UserPlus } from 'lucide-react';
import type { CreateUserData } from '../../../shared/types/userTypes';
import { UserModal } from './UserModal';

interface UsersHeaderProps {
  onNewUser: (data: CreateUserData) => void;
}

export const UsersHeader = ({ onNewUser }: UsersHeaderProps) => {
  const [opened, setOpened] = useState(false);

  const handleOpen = () => setOpened(true);
  const handleClose = () => setOpened(false);

  const handleSubmit = (data: CreateUserData) => {
    onNewUser(data);
    setOpened(false);
  };

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
        onClick={handleOpen}
        color="dark"
      >
        Nuevo Usuario
      </Button>
      <UserModal opened={opened} onClose={handleClose} onSubmit={handleSubmit} />
    </Group>
  );
};