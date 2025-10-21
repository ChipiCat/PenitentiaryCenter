import React from 'react';
import { Card, Group, Title, ThemeIcon, Grid, Stack, Text, Badge, Alert } from '@mantine/core';
import { Phone } from 'lucide-react';
import type { Contact } from '../../../../../shared/services/prisonersApi';

interface ContactsCardProps {
  contacts: Contact[];
}

export const ContactsCard: React.FC<ContactsCardProps> = ({ contacts }) => {
  return (
    <Card withBorder padding="lg">
      <Group mb="md">
        <ThemeIcon variant="light" color="green">
          <Phone size={20} />
        </ThemeIcon>
        <Title order={3} size="h4">
          Contactos de Emergencia ({contacts.length})
        </Title>
      </Group>
      
      {contacts.length > 0 ? (
        <Grid>
          {contacts.map((contact) => (
            <Grid.Col key={contact.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card withBorder padding="md" style={{ 
                backgroundColor: 'var(--mantine-color-gray-0)' 
              }}>
                <Stack gap="xs">
                  <Text fw={600} size="sm">{contact.name}</Text>
                  <Badge variant="outline" size="xs">
                    {contact.relationship}
                  </Badge>
                  <Group gap={4}>
                    <Phone size={12} />
                    <Text size="xs" c="dimmed">{contact.phone}</Text>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      ) : (
        <Alert color="yellow" variant="light">
          <Text size="sm">No hay contactos de emergencia registrados</Text>
        </Alert>
      )}
    </Card>
  );
};