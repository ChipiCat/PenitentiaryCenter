import React from 'react';
import { Group, Title, Text, Button, ActionIcon, Tooltip } from '@mantine/core';
import { Plus, Users, Search, Filter } from 'lucide-react';

interface PrisonersHeaderProps {
  onCreateNew: () => void;
}

export const PrisonersHeader: React.FC<PrisonersHeaderProps> = ({ onCreateNew }) => {
  return (
    <Group justify="space-between">
      <div>
        <Group gap="sm" align="center">
          <Users size={24} color="var(--mantine-color-blue-6)" />
          <div>
            <Title order={1} size="h2">
              Gestión de Prisioneros
            </Title>
            <Text c="dimmed" size="sm">
              Administra la información de los reclusos del centro penitenciario
            </Text>
          </div>
        </Group>
      </div>

      <Group>
        <Group gap="xs" visibleFrom="sm">
          <Tooltip label="Buscar prisioneros">
            <ActionIcon variant="subtle" size="lg">
              <Search size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Filtros avanzados">
            <ActionIcon variant="subtle" size="lg">
              <Filter size={18} />
            </ActionIcon>
          </Tooltip>
         
        </Group>

        <Button
          leftSection={<Plus size={16} />}
          onClick={onCreateNew}
          size="sm"
          gradient={{ from: "blue", to: "cyan", deg: 45 }}
          variant="gradient"
        >
          Nuevo Prisionero
        </Button>
      </Group>
    </Group>
  );
};