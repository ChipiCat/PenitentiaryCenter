import { Container, Stack } from '@mantine/core';
import { UsersHeader } from './components/UsersHeader';
import { UsersStatsSection } from './components/UsersStatsSection';
import { UsersTable } from './components/UsersTable';
import { useUsers } from './hooks/useUsers';

const UsersPage = () => {
  const {
    stats,
    users,
    handleNewUser,
    handleEditUser,
    handleDeleteUser,
  } = useUsers();

  const userActions = {
    onEdit: handleEditUser,
    onDelete: handleDeleteUser,
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <UsersHeader onNewUser={handleNewUser} />
        <UsersStatsSection stats={stats} />
        <UsersTable users={users} actions={userActions} />
      </Stack>
    </Container>
  );
};

export default UsersPage;