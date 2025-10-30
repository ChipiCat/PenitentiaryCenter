import React from 'react';
import { Group, Title, Text, Button, SegmentedControl } from '@mantine/core';
import { Plus, Users, Table, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../../shared/config';

interface PrisonersHeaderProps {
  onCreateNew: () => void;
  viewType: 'table' | 'cards';
  onViewChange: (view: 'table' | 'cards') => void;
}

export const PrisonersHeader: React.FC<PrisonersHeaderProps> = ({ onCreateNew, viewType, onViewChange }) => {
  const navigate = useNavigate();
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
          <SegmentedControl
            value={viewType}
            onChange={v => onViewChange(v as 'table' | 'cards')}
            data={[
              {
                value: 'table',
                label: (
                  <Group gap={6} align="center" style={{ flexWrap: 'nowrap' }}>
                    <Table size={20} color={viewType === 'table' ? '#fff' : '#868e96'} />
                    <span style={{ fontWeight: 500, color: viewType === 'table' ? '#fff' : '#868e96', lineHeight: '1', display: 'inline-block', fontSize: 16 }}>Tabla</span>
                  </Group>
                ),
              },
              {
                value: 'cards',
                label: (
                  <Group gap={6} align="center" style={{ flexWrap: 'nowrap' }}>
                    <LayoutGrid size={20} color={viewType === 'cards' ? '#fff' : '#868e96'} />
                    <span style={{ fontWeight: 500, color: viewType === 'cards' ? '#fff' : '#868e96', lineHeight: '1', display: 'inline-block', fontSize: 16 }}>Tarjetas</span>
                  </Group>
                ),
              },
            ]}
            size="sm"
            radius="md"
            color="blue"
            styles={{
              root: { background: '#fff', borderRadius: 12, boxShadow: 'none', border: 'none', padding: 2 },
              indicator: { background: '#2563eb', borderRadius: 8, boxShadow: 'none' },
              control: { fontWeight: 500, padding: '0 18px', minWidth: 110, background: 'transparent', color: '#868e96' },
            }}
          />
        </Group>

        <Button
          leftSection={<Plus size={16} color="#fff" />}
          onClick={() => navigate(ROUTES.PRISONERS_NEW)}
          size="sm"
          gradient={{ from: "blue", to: "cyan", deg: 45 }}
          variant="gradient"
          style={{ fontWeight: 600, borderRadius: 12 }}
        >
          Nuevo Interno
        </Button>
      </Group>
    </Group>
  );
};