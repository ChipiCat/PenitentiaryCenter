import type { PrisonerStatus } from './types';

export const getStatusColor = (status: PrisonerStatus): string => {
  switch (status) {
    case 'Activo': return 'green';
    case 'En Proceso': return 'yellow';
    case 'Liberado': return 'purple';
    default: return 'gray';
  }
};

export const getStatusFilterOptions = () => [
  { value: '', label: 'Todos los estados' },
  { value: 'Activo', label: 'Activo' },
  { value: 'En Proceso', label: 'En Proceso' },
  { value: 'Liberado', label: 'Liberado' }
];