import React from 'react';
import { Card, Center, Stack, Title, Text, Button } from '@mantine/core';
import { Plus, Users } from 'lucide-react';

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
            
          </div>

        </Stack>
      </Center>
    </Card>
  );
};