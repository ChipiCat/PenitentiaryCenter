import React from 'react';
import { 
  TextInput, 
  Group, 
  Stack, 
  Title,
  Card,
  Button,
  ActionIcon,
  Alert,
  Text,
} from '@mantine/core';
import { Plus, Trash2, Users, AlertCircle } from 'lucide-react';

interface Contact {
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  address?: string;
  is_emergency?: boolean;
}

interface ContactsStepProps {
  data: { contacts?: Contact[] };
  onUpdate: (updates: { contacts: Contact[] }) => void;
  errors?: Record<string, string>;
}

export const ContactsStep: React.FC<ContactsStepProps> = ({ 
  data, 
  onUpdate, 
  errors = {} 
}) => {
  
  const contacts = data.contacts || [];

  // Agregar nuevo contacto
  const handleAddContact = () => {
    const newContacts = [
      ...contacts,
      { name: '', relationship: '', phone: '' }
    ];
    onUpdate({ contacts: newContacts });
  };

  // Eliminar contacto
  const handleRemoveContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    onUpdate({ contacts: newContacts });
  };

  // Actualizar contacto específico
  const handleContactChange = (index: number, field: string, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    onUpdate({ contacts: newContacts });
  };

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={4} size="h5" c="orange">
              📞 Contactos de Emergencia
            </Title>
            <Text size="sm" c="dimmed">
              Personas a contactar en caso de emergencia
            </Text>
          </div>
          <Button
            leftSection={<Plus size={16} />}
            variant="light"
            onClick={handleAddContact}
            size="sm"
          >
            Agregar Contacto
          </Button>
        </Group>

        {/* Mensaje si no hay contactos */}
        {contacts.length === 0 && (
          <Alert 
            icon={<Users size={16} />} 
            color="blue" 
            variant="light"
          >
            <Text size="sm">
              No hay contactos registrados. Agregue al menos un contacto de emergencia.
            </Text>
          </Alert>
        )}

        {/* Lista de contactos */}
        <Stack gap="md">
          {contacts.map((contact, index) => (
            <Card key={index} withBorder padding="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
              <Group justify="space-between" mb="sm">
                <Text size="sm" fw={500} c="blue">
                  Contacto {index + 1}
                </Text>
                {contacts.length > 0 && (
                  <ActionIcon
                    color="red"
                    variant="light"
                    size="sm"
                    onClick={() => handleRemoveContact(index)}
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                )}
              </Group>

              <Stack gap="sm">
                <Group grow>
                  <TextInput
                    label="Nombre Completo"
                    placeholder="Nombre y apellidos"
                    value={contact.name || ''}
                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                    required
                    error={errors[`contacts.${index}.name`]}
                  />
                  <TextInput
                    label="Parentesco/Relación"
                    placeholder="Ej: Madre, Hermano, Esposa"
                    value={contact.relationship || ''}
                    onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                    required
                    error={errors[`contacts.${index}.relationship`]}
                  />
                </Group>
                
                <TextInput
                  label="Teléfono"
                  placeholder="Número de teléfono o celular"
                  value={contact.phone || ''}
                  onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                  required
                  error={errors[`contacts.${index}.phone`]}
                />
              </Stack>
            </Card>
          ))}
        </Stack>

        {/* Error general de contactos */}
        {errors.contacts && (
          <Alert icon={<AlertCircle size={16} />} color="red" mt="md">
            {errors.contacts}
          </Alert>
        )}

        {/* Botón para agregar si no hay contactos */}
        {contacts.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Button
              leftSection={<Plus size={16} />}
              onClick={handleAddContact}
            >
              Agregar Primer Contacto
            </Button>
          </div>
        )}
      </Card>
    </Stack>
  );
};