import { Group, Title, Text, Button, TextInput, Stack } from '@mantine/core';
import { UserPlus, Search } from 'lucide-react';

interface UsersHeaderProps {
  onOpenModal: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export const UsersHeader = ({ onOpenModal, search, onSearchChange }: UsersHeaderProps) => {
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
          onClick={onOpenModal}
          color="dark"
        >
          Nuevo Usuario
        </Button>
      </Group>
    </Group>
  );
};