import React from 'react';
import { ActivityFiltersSimple } from "../../../shared/components/activity/ActivityFiltersSimple";
import type { FilterOption } from "../../../shared/components/activity/ActivityFilters";

interface SystemActivityFiltersProps {
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
}

export const SystemActivityFilters: React.FC<SystemActivityFiltersProps> = ({
  actionFilter,
  onActionFilterChange,
  timeFilter,
  onTimeFilterChange,
  searchTerm,
  onSearchChange,
  showSearch = true
}) => {
  const actionOptions: FilterOption[] = [
    { value: 'all', label: 'Todas las acciones' },
    { value: 'login', label: 'Inicios de sesión' },
    { value: 'create', label: 'Creaciones' },
    { value: 'update', label: 'Actualizaciones' },
    { value: 'export', label: 'Exportaciones' },
    { value: 'delete', label: 'Eliminaciones' },
    { value: 'view', label: 'Visualizaciones' },
    { value: 'print', label: 'Impresiones' }
  ];

  const timeOptions: FilterOption[] = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este año' }
  ];

  return (
    <ActivityFiltersSimple
      actionFilter={actionFilter}
      onActionFilterChange={onActionFilterChange}
      timeFilter={timeFilter}
      onTimeFilterChange={onTimeFilterChange}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      actionOptions={actionOptions}
      timeOptions={timeOptions}
      showSearch={showSearch}
      searchPlaceholder="Buscar en actividades del sistema..."
    />
  );
};