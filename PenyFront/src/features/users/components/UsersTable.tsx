import { Paper, Title, Table, Pagination, Group } from '@mantine/core';
import type { User, UserActions } from '../../../shared/types/userTypes';
import { UserTableRow } from './UserTableRow';
import { useState } from 'react';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  SECRETARY: 'Secretario',
  USER: 'Usuario',
  OWNER: 'Propietario',
};

interface UsersTableProps {
  users: User[];
  actions: UserActions;
}

export const UsersTable = ({ users, actions }: UsersTableProps) => {
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const paginatedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Paper p="md" withBorder>
      <Title order={3} size="h4" mb="md">
        Lista de Usuarios
      </Title>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Usuario</Table.Th>
            <Table.Th>Rol</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Fecha Creación</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {paginatedUsers.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              roleLabel={ROLE_LABELS[user.role] || user.role}
              actions={actions}
            />
          ))}
        </Table.Tbody>
      </Table>
      <Group justify="center" mt="md">
        <Pagination
          total={totalPages}
          value={page}
          onChange={setPage}
          size="sm"
          radius="md"
          color="blue"
        />
      </Group>
    </Paper>
  );
};