import React, { useState } from 'react';
import { Card, Stack, Title, Group, Button, Text, ActionIcon, Badge, Modal } from '@mantine/core';
import { User, Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import type { Child } from '../../../../../shared/types/childTypes';
import { ChildFormModal } from '../modals/ChildFormModal';
import { useChildrenManager } from '../hooks/useChildrenManager';
import { useGlobalContext } from '../../../../../shared/hooks/useGlobalContext';

interface ChildrenSectionProps {
  prisonerId: string;
  children: Child[];
  onUpdate: () => void;
}

export const ChildrenSection: React.FC<ChildrenSectionProps> = ({
  prisonerId,
  children,
  onUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const { user } = useGlobalContext();

  const { deleteChild, isDeleting } = useChildrenManager(prisonerId, onUpdate);

  const handleAdd = () => {
    setEditingChild(null);
    setIsModalOpen(true);
  };

  const handleEdit = (child: Child) => {
    setEditingChild(child);
    setIsModalOpen(true);
  };

  const handleDelete = (child: Child) => {
    setChildToDelete(child);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!childToDelete) return;

    try {
      await deleteChild(childToDelete.id);
      setDeleteModalOpen(false);
      setChildToDelete(null);
    } catch (error) {
      console.log('Error deleting child:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingChild(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha no especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card withBorder padding="lg" className="h-full">
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <User size={20} className="text-blue-600" />
            <Title order={4} size="h5">
              Hijos Registrados
            </Title>
            <Badge variant="light" color="blue" size="sm">
              {children.length}
            </Badge>
          </Group>
          {user?.role === 'ADMIN' || user?.role === 'SECRETARY' ? (
          <Button
            leftSection={<Plus size={16} />}
            variant="light"
            color="blue"
            onClick={handleAdd}
          >
            Agregar Hijo
          </Button>
          ) : null}
        </Group>

        {children.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No hay hijos registrados
          </Text>
        ) : (
          <Stack gap="sm">
            {children.map((child) => (
              <Card key={child.id} withBorder padding="md" className="hover:shadow-md transition-shadow">
                <Group justify="space-between" wrap="nowrap">
                  <div className="flex-1">
                    <Group gap="xs" mb={4}>
                      <Text fw={600} size="sm">
                        {child.full_name?? "Sin nombre"}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Calendar size={14} className="text-gray-500" />
                      <Text size="xs" c="dimmed">
                        {formatDate(child.birth_date)}
                      </Text>
                    </Group>
                  </div>
                  {user?.role === 'ADMIN' || user?.role === 'SECRETARY' ? (
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEdit(child)}
                      aria-label="Editar hijo"
                    >
                      <Pencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(child)}
                      aria-label="Eliminar hijo"
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Group>
                  ) : null}
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Card>

      {/* Modal de Creación/Edición */}
      <ChildFormModal
        prisonerId={prisonerId}
        child={editingChild}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={onUpdate}
      />

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        centered
      >
        <Stack gap="md">
          <Text>
            ¿Estás seguro de que deseas eliminar a <strong>{childToDelete?.full_name}</strong>?
          </Text>
          <Text size="sm" c="dimmed">
            Esta acción no se puede deshacer.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button
              variant="light"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={confirmDelete}
              loading={isDeleting}
            >
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
