import { Table, Group, Avatar, Text, Badge, ActionIcon, Modal, Button, Stack } from "@mantine/core";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import type { User, UserActions } from "../../../shared/types/userTypes";
import { getRoleColor } from "../utils/userUtils";

interface UserTableRowProps {
  user: User;
  actions: UserActions;
  roleLabel: string;
}

export const UserTableRow = ({
  user,
  actions,
  roleLabel,
}: UserTableRowProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await actions.onDelete(user.id);
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Table.Tr>
        <Table.Td>
          <Group gap="sm">
            <Avatar
              size="md"
              color={getRoleColor(user.role)}
              src={user.photoFile?.url}
            />
            <Text fw={500} size="sm">
              {user.name}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge color={getRoleColor(user.role)} variant="light">
            {roleLabel}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{user.email}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">
            {new Date(user.createdAt)
              .toLocaleString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              .replace(",", " -")}
          </Text>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => actions.onEdit(user.id)}
            >
              <Edit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 size={16} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar eliminación"
        centered
      >
        <Stack gap="md">
          <div>
            <Text size="sm" c="dimmed" mb="xs">
              ¿Está seguro que desea eliminar el perfil de usuario?
            </Text>
            <Text size="sm" fw={500} c="red">
              Usuario: <b>{user.name}</b>
            </Text>
            <Text size="sm" fw={500} c="red">
              Email: <b>{user.email}</b>
            </Text>
            <Text size="xs" c="dimmed" mt="md">
              Esta acción no se puede deshacer.
            </Text>
          </div>

          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleDeleteConfirm}
              loading={isDeleting}
            >
              Eliminar usuario
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};