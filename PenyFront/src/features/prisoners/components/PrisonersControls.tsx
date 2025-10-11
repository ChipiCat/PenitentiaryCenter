import {
  Group,
  TextInput,
  Select,
  Paper,
  Switch,
  Button,
  Text
} from '@mantine/core';
import {
  Search,
  Filter,
  Plus,
  List,
  Grid3X3
} from 'lucide-react';
import type { Prisoner, ViewMode } from '../utils/types';
import { getStatusFilterOptions } from '../utils/prisonerUtils';

interface PrisonersControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filteredPrisoners: Prisoner[];
  onNewPrisoner: () => void;
}

export const PrisonersControls = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
  filteredPrisoners,
  onNewPrisoner
}: PrisonersControlsProps) => {
  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Group>
          <TextInput
            placeholder="Buscar por nombre o cédula..."
            leftSection={<Search size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            w={300}
          />
          <Select
            placeholder="Filtrar por estado"
            leftSection={<Filter size={16} />}
            data={getStatusFilterOptions()}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
          />
        </Group>

        <Group>
          <Switch
            checked={viewMode === 'table'}
            onChange={(event) => setViewMode(event.currentTarget.checked ? 'table' : 'cards')}
            onLabel={<List size={16} />}
            offLabel={<Grid3X3 size={16} />}
            label={viewMode === 'table' ? 'Tabla' : 'Cards'}
            size="md"
          />
          <Button
            leftSection={<Plus size={16} />}
            onClick={onNewPrisoner}
          >
            Nuevo Recluso
          </Button>
        </Group>
      </Group>

      {/* Estadísticas rápidas */}
      <Group>
        <Text size="sm" c="dimmed">
          Total: <Text component="span" fw={500}>{filteredPrisoners.length}</Text> internos
        </Text>
        <Text size="sm" c="dimmed">•</Text>
        <Text size="sm" c="green">
          Activos: {filteredPrisoners.filter(p => p.status === 'Activo').length}
        </Text>
        <Text size="sm" c="yellow">
          En Proceso: {filteredPrisoners.filter(p => p.status === 'En Proceso').length}
        </Text>
        <Text size="sm" c="purple">
          Liberados: {filteredPrisoners.filter(p => p.status === 'Liberado').length}
        </Text>
      </Group>
    </Paper>
  );
};