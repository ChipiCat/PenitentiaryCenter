import {
  Paper,
  Stack,
  Text,
  Button
} from '@mantine/core';
import { Search, Plus } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onNewPrisoner: () => void;
}

export const EmptyState = ({ hasFilters, onNewPrisoner }: EmptyStateProps) => {
  return (
    <Paper p="xl" withBorder>
      <Stack align="center" gap="md">
        <Search size={48} color="var(--mantine-color-gray-5)" />
        <Text size="lg" fw={500}>No se encontraron internos</Text>
        <Text c="dimmed" ta="center">
          {hasFilters
            ? 'Intenta ajustar los filtros de búsqueda'
            : 'No hay internos registrados en el sistema'}
        </Text>
        {!hasFilters && (
          <Button leftSection={<Plus size={16} />} onClick={onNewPrisoner}>
            Registrar Primer Interno
          </Button>
        )}
      </Stack>
    </Paper>
  );
};