import { Container, Stack } from '@mantine/core';
import { UsersHeader } from './components/UsersHeader';
import { UsersTable } from './components/UsersTable';
import { UserModal } from './components/UserModal';
import { useUsers } from './hooks/useUsers';
import type { CreateUserData, UpdateUserData, User } from '../../shared/types/userTypes';
import { useState } from 'react';

const UsersPage = () => {
  const {
    users,
    handleNewUser,
    handleEditUser,
    handleDeleteUser,
  } = useUsers();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Nuevo usuario
  const handleNewUserHeader = (data: CreateUserData) => {
    handleNewUser(data);
  };

  // Editar usuario
  const handleEditUserTable = (userId: string) => {
    const user = users.find(u => u.id === userId) || null;
    setSelectedUser(user ? { ...user, } : null);
    setEditModalOpen(true);
  };

  const handleEditUserSubmit = (data: UpdateUserData) => {
    if (selectedUser) {
      handleEditUser(selectedUser.id, data);
      setEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Eliminar usuario
  const handleDeleteUserTable = (userId: string) => {
    handleDeleteUser(userId);
  };

  const userActions = {
    onEdit: handleEditUserTable,
    onDelete: handleDeleteUserTable,
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <UsersHeader onNewUser={handleNewUserHeader} />
        <UsersTable users={users} actions={userActions} />
        <UserModal
          opened={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedUser(null); }}
          onSubmit={handleEditUserSubmit}
          user={selectedUser}
        />
      </Stack>
    </Container>
  );
};

export default UsersPage;