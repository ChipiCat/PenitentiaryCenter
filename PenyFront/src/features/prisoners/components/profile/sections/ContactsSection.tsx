import React, { useState } from 'react';
import { Card, Stack, Title, Group, Button, Text, ActionIcon, Badge, Modal } from '@mantine/core';
import { User, Plus, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import type { Contact } from '../../../../../shared/types/contactTypes';
import { ContactFormModal } from '../modals/ContactFormModal';
import { useContactsManager } from '../hooks/useContactsManager';

interface ContactsSectionProps {
  prisonerId: string;
  contacts: Contact[];
  onUpdate: () => void;
}

export const ContactsSection: React.FC<ContactsSectionProps> = ({
  prisonerId,
  contacts,
  onUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const { deleteContact, isDeleting } = useContactsManager(prisonerId, onUpdate);

  const handleAdd = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    try {
      await deleteContact(contactToDelete.id);
      setDeleteModalOpen(false);
      setContactToDelete(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  return (
    <>
      <Card withBorder padding="lg" className="h-full">
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <User size={20} className="text-blue-600" />
            <Title order={4} size="h5">
              Contactos de Emergencia
            </Title>
            <Badge variant="light" color="purple" size="sm">
              {contacts.length}
            </Badge>
          </Group>
          <Button
            leftSection={<Plus size={16} />}
            variant="light"
            color="blue"
            onClick={handleAdd}
          >
            Agregar Contacto
          </Button>
        </Group>

        {contacts.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No hay contactos registrados
          </Text>
        ) : (
          <Stack gap="sm">
            {contacts.map((contact) => (
              <Card
                key={contact.id}
                withBorder
                padding="md"
                className="hover:shadow-md transition-shadow"
              >
                <Group justify="space-between" wrap="nowrap">
                  <div className="flex-1">
                    <Group gap="xs" mb={4}>
                      <Text fw={600} size="sm">
                        {contact.name}
                      </Text>
                      {contact.is_emergency && (
                        <Badge color="red" size="xs">
                          Emergencia
                        </Badge>
                      )}
                    </Group>
                    
                    <Stack gap={4}>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          Relación: <strong>{contact.relationship}</strong>
                        </Text>
                      </Group>
                      
                      {contact.phone && (
                        <Group gap="xs">
                          <Phone size={12} className="text-gray-500" />
                          <Text size="xs" c="dimmed">
                            {contact.phone}
                          </Text>
                        </Group>
                      )}
                      
                      {contact.email && (
                        <Group gap="xs">
                          <Mail size={12} className="text-gray-500" />
                          <Text size="xs" c="dimmed">
                            {contact.email}
                          </Text>
                        </Group>
                      )}
                      
                      {contact.address && (
                        <Group gap="xs">
                          <MapPin size={12} className="text-gray-500" />
                          <Text size="xs" c="dimmed">
                            {contact.address}
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </div>
                  
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEdit(contact)}
                      aria-label="Editar contacto"
                    >
                      <Pencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(contact)}
                      aria-label="Eliminar contacto"
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Card>

      {/* Modal de Creación/Edición */}
      <ContactFormModal
        prisonerId={prisonerId}
        contact={editingContact}
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
            ¿Estás seguro de que deseas eliminar el contacto de{' '}
            <strong>{contactToDelete?.name}</strong>?
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
