import React, { useState } from 'react';
import { Card, Stack, Title, Group, Button, Text, ActionIcon, Badge, Modal } from '@mantine/core';
import { FileDown, Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import type { Belonging } from '../../../../../shared/types/belongingTypes';
import { BelongingFormModal } from '../modals/BelongingFormModal';
import { useBelongingsManager } from '../hooks/useBelongingsManager';
import { useGlobalContext } from '../../../../../shared/hooks/useGlobalContext';
import FileView from '../../../../../shared/components/FileView';
import { belongingsService } from '../../../../../shared/services';

interface BelongingsSectionProps {
  prisonerId: string;
  belongings: Belonging[];
  onUpdate: () => void;
}

export const BelongingsSection: React.FC<BelongingsSectionProps> = ({
  prisonerId,
  belongings,
  onUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBelonging, setEditingBelonging] = useState<Belonging | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [belongingToDelete, setBelongingToDelete] = useState<Belonging | null>(null);

  const { deleteBelonging, isDeleting } = useBelongingsManager(
    prisonerId,
    onUpdate
  );

  const handleAdd = () => {
    setEditingBelonging(null);
    setIsModalOpen(true);
  };

  const handleEdit = (belonging: Belonging) => {
    setEditingBelonging(belonging);
    setIsModalOpen(true);
  };

  const handleDelete = (belonging: Belonging) => {
    setBelongingToDelete(belonging);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!belongingToDelete) return;

    try {
      await deleteBelonging(belongingToDelete.id);
      setDeleteModalOpen(false);
      setBelongingToDelete(null);
    } catch (error) {
      console.error('Error deleting belonging:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBelonging(null);
  };

  const { user } = useGlobalContext();

  return (
    <>
      <Card withBorder padding="lg" className="h-full">
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <FileDown size={20} className="text-blue-600" />
            <Title order={4} size="h5">
              Pertenencias al Ingreso
            </Title>
            <Badge variant="light" color="blue" size="sm">
              {belongings.length}
            </Badge>
          </Group>
          {(user?.role === 'ADMIN' || user?.role === 'SECRETARY') && (
            <Button
              leftSection={<Plus size={16} />}
              variant="light"
              color="blue"
              onClick={handleAdd}
            >
              Agregar Pertenencia
            </Button>
          )}
        </Group>

        {belongings.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No hay pertenencias registradas
          </Text>
        ) : (
          <Stack gap="sm">
            {belongings.map((belonging) => (
              <Card
                key={belonging.id}
                withBorder
                padding="md"
                className="hover:shadow-md transition-shadow"
              >
                <Group justify="space-between" wrap="nowrap">
                  <div className="flex-1">
                    <Group gap="xs" mb={4}>
                      <Text fw={600} size="sm">
                        {belonging.description}
                      </Text>
                      {belonging.is_returned ? (
                        <Badge color="green" size="xs" leftSection={<CheckCircle2 size={12} />}>
                          Devuelto
                        </Badge>
                      ) : (
                        <Badge color="gray" size="xs" leftSection={<XCircle size={12} />}>
                          En custodia
                        </Badge>
                      )}
                    </Group>
                    <Group gap="md">
                      <Text size="xs" c="dimmed">
                        Cantidad: <strong>{belonging.quantity}</strong>
                      </Text>
                      {belonging.condition && (
                        <Text size="xs" c="dimmed">
                          Estado: <strong>{belonging.condition}</strong>
                        </Text>
                      )}

                    </Group>
                  </div>
                  {user?.role === 'ADMIN' || user?.role === 'SECRETARY' ? (
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleEdit(belonging)}
                        aria-label="Editar pertenencia"
                      >
                        <Pencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDelete(belonging)}
                        aria-label="Eliminar pertenencia"
                      >
                        <Trash2 size={16} />
                      </ActionIcon>
                    </Group>
                  ) : null}
                </Group>
                {belonging.file && (
                  <div className='max-w-100'>
                    <FileView fileInfo={belonging.file} label='Archivo pertenencia' updateFile={(file: File) => belongingsService.uploadInventory(belonging.prisoner_id, belonging.id, file)} onSuccess={onUpdate} />
                  </div>
                )}
              </Card>
            ))}
          </Stack>
        )}
      </Card>

      {/* Modal de Creación/Edición */}
      <BelongingFormModal
        prisonerId={prisonerId}
        belonging={editingBelonging}
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
            ¿Estás seguro de que deseas eliminar <strong>{belongingToDelete?.description}</strong>?
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
            <Button color="red" onClick={confirmDelete} loading={isDeleting}>
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
