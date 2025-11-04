import { useState } from 'react';
import { Group, Title, Text, Button, TextInput, Stack } from '@mantine/core';
import { UserPlus, Search } from 'lucide-react';
import type { CreateUserData } from '../../../shared/types/userTypes';
import { UserModal } from './UserModal';

interface UsersHeaderProps {
  onNewUser: (data: CreateUserData) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export const UsersHeader = ({ onNewUser, search, onSearchChange }: UsersHeaderProps) => {
  const [opened, setOpened] = useState(false);

  const handleOpen = () => setOpened(true);
  const handleClose = () => setOpened(false);

  const handleSubmit = (data: CreateUserData) => {
    onNewUser(data);
    setOpened(false);
  };

  return (
    <Group justify="space-between" align="end">
      <Stack gap={0}>
        <Title order={2}>Gestión de Usuarios</Title>
        <Text c="dimmed" size="sm">
          Administra los usuarios del sistema penitenciario
        </Text>
      </Stack>
      <Group>
        <TextInput
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          leftSection={<Search size={16} />}
          style={{ maxWidth: 220 }}
        />
        <Button
          leftSection={<UserPlus size={16} />}
          onClick={handleOpen}
          color="dark"
        >
          Nuevo Usuario
        </Button>
      </Group>
      <UserModal opened={opened} onClose={handleClose} onSubmit={handleSubmit} />
    </Group>
  );
};