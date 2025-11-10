import { Paper, Title, Table, Loader } from '@mantine/core';
import type { User, UserActions } from '../../../shared/types/userTypes';
import { UserTableRow } from './UserTableRow';
import { CustomPagination } from '../../../shared/components/CustomPagination';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  SECRETARY: 'Secretario',
  DIRECTOR: 'Director',
};

interface UsersTableProps {
  users: User[];
  actions: UserActions;
  page: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  loading?: boolean;
}

export const UsersTable = ({ 
  users, 
  actions, 
  page, 
  total, 
  pageSize = 10, 
  onPageChange,
  onPageSizeChange,
  loading 
}: UsersTableProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  return (
    <Paper p="md" withBorder>
      <Title order={3} size="h4" mb="md">
        Lista de Usuarios
      </Title>
      {loading ? (
        <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <Loader size={48} color="blue" />
          <div style={{ color: '#888', marginTop: 8 }}>Recargando usuarios...</div>
        </div>
      ) : (
        <>
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
                  roleLabel={ROLE_LABELS[user.role] || user.role}
                  actions={actions}
                />
              ))}
            </Table.Tbody>
          </Table>

          {totalPages > 0 && (
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              total={total}
              onPageChange={onPageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          )}
        </>
      )}
    </Paper>
  );
};