import { Paper, Title, Table } from '@mantine/core';
import type { User, UserActions } from '../../../shared/types/userTypes';
import { UserTableRow } from './UserTableRow';

interface UsersTableProps {
  users: User[];
  actions: UserActions;
}

export const UsersTable = ({ users, actions }: UsersTableProps) => {
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
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              actions={actions}
            />
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};