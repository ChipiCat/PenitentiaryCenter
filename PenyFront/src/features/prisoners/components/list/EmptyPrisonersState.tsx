import React from 'react';
import { Card, Center, Stack, Title, Button } from '@mantine/core';
import { Users, Plus } from 'lucide-react';

interface EmptyPrisonersStateProps {
  onCreateNew: () => void;
}

export const EmptyPrisonersState: React.FC<EmptyPrisonersStateProps> = ({ onCreateNew }) => {
  return (
    <Card withBorder padding="xl">
      <Center>
        <Stack gap="lg" align="center" style={{ textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "var(--mantine-color-gray-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={32} color="var(--mantine-color-gray-5)" />
          </div>

          <div>
            <Title order={3} size="h4" mb="xs">
              Ningún prisionero encontrado
            </Title>
            <p style={{ color: "var(--mantine-color-gray-6)", marginBottom: "1rem" }}>
              Crea tu primer prisionero para comenzar
            </p>
          </div>

          <Button leftSection={<Plus size={16} />} onClick={onCreateNew}>
            Crear Prisionero
          </Button>

        </Stack>
      </Center>
    </Card>
  );
};