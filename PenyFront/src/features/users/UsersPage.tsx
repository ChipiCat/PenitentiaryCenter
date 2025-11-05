import { Container, Notification, Stack } from "@mantine/core";
import { UsersHeader } from "./components/UsersHeader";
import { UsersTable } from "./components/UsersTable";
import { UserModal } from "./components/UserModal";
import { useUsers } from "./hooks/useUsers";
import type {
  CreateUserData,
  UpdateUserData,
  User,
} from "../../shared/types/userTypes";
import { useEffect, useState } from "react";

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    users,
    handleNewUser,
    handleEditUser,
    handleDeleteUser,
    setFilters,
    fetchUsers,
    total,
    loading,
  } = useUsers();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setFilters((prev) => ({ ...prev, search: value }));
  };

  useEffect(() => {
    fetchUsers({ page, size: pageSize });
  }, [page, search]);

  // Editar usuario
  const handleEditUserTable = (userId: string) => {
    const user = users.find((u) => u.id === userId) || null;
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleEditUserSubmit = async (data: CreateUserData | FormData) => {
    try {
      if (selectedUser) {
        setModalLoading(true);
        // Si es FormData, extraer los valores para UpdateUserData
        let updateData: UpdateUserData = {};
        if (data instanceof FormData) {
          updateData = {
            name: data.get("name") as string,
            email: data.get("email") as string,
            role: data.get("role") as string,
            cellphone: data.get("cellphone") as string | undefined,
            ci: data.get("ci") as string | undefined,
            department: data.get("department") as string | undefined,
            departmentalDirectorateUnit: data.get("departmentalDirectorateUnit") as string | undefined,
          };
        } else {
          updateData = data as UpdateUserData;
        }
        await handleEditUser(selectedUser.id, updateData);
        setEditModalOpen(false);
        setSelectedUser(null);
        setNotification("Usuario actualizado correctamente");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setNotification("Error al actualizar usuario");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setModalLoading(false);
    }
  };

  const handleNewUserModal = async (data: CreateUserData | FormData) => {
    try {
      setModalLoading(true);
      await handleNewUser(data);
      setEditModalOpen(false);
      setSelectedUser(null);
      setNotification("Usuario nuevo creado correctamente");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error creating user:", error);
      setNotification("Error al crear usuario");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUserTable = (userId: string) => {
    handleDeleteUser(userId);
  };

  const userActions = {
    onEdit: handleEditUserTable,
    onDelete: handleDeleteUserTable,
  };



  return (
    <>
      <Container size="xl" py="md" style={{ position: "relative" }}>
        <Stack gap="lg">
          <UsersHeader
            onOpenModal={() => {
              setEditModalOpen(true);
            setSelectedUser(null);
          }}
          search={search}
          onSearchChange={handleSearchChange}
        />
        <UsersTable
          users={users}
          actions={userActions}
          page={page}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          loading={loading}
        />
        <UserModal
          opened={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={selectedUser ? handleEditUserSubmit : handleNewUserModal}
          user={selectedUser}
          isLoading={modalLoading}
        />
      </Stack>
    </Container>
     {notification && (
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 24,
            zIndex: 9999,
            minWidth: 300,
            maxWidth: 400,
          }}
        >
          <Notification
            color="green"
            onClose={() => setNotification(null)}
            closeButtonProps={{ "aria-label": "Cerrar notificación" }}
          >
            {notification}
          </Notification>
        </div>
      )}
      </>
  );
};

export default UsersPage;
