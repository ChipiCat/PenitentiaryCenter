import React from 'react';
import { Stack } from '@mantine/core';
import { ActivityFilters, type ActivityFilter } from './ActivityFilters';
import { ActivityTimeline, type ActivityItem } from './ActivityTimeline';
import { ActivityStats, type ActivityStat } from './ActivityStats';

export type { ActivityFilter } from './ActivityFilters';
export type { ActivityItem } from './ActivityTimeline';
export type { ActivityStat } from './ActivityStats';

export interface ActivitySectionProps {
  // Filter props
  title: string;
  icon: React.JSX.Element;
  iconColor: string;
  entityInfo?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string | null;
  onFilterChange: (value: string | null) => void;
  filterOptions: ActivityFilter[];
  
  // Timeline props
  activities: ActivityItem[];
  filteredActivities: ActivityItem[];
  getIcon: (type: string) => React.JSX.Element;
  getColor: (type: string, status?: string) => string;
  getTypeLabel: (type: string) => string;
  emptyMessage?: string;
  
  // Stats props
  stats?: ActivityStat[];
  showStats?: boolean;
  
  // Layout
  gap?: string;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  title,
  icon,
  iconColor,
  entityInfo,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  filterOptions,
  activities,
  filteredActivities,
  getIcon,
  getColor,
  getTypeLabel,
  emptyMessage,
  stats,
  showStats = true,
  gap = "lg"
}) => {
  return (
    <Stack gap={gap}>
      {/* Filtros */}
      <ActivityFilters
        title={title}
        icon={icon}
        iconColor={iconColor}
        entityInfo={entityInfo}
        totalCount={filteredActivities.length}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        filterType={filterType}
        onFilterChange={onFilterChange}
        filterOptions={filterOptions}
      />

      {/* Timeline */}
      <ActivityTimeline
        activities={filteredActivities}
        getIcon={getIcon}
        getColor={getColor}
        getTypeLabel={getTypeLabel}
        emptyMessage={emptyMessage || (activities.length === 0 
          ? "No hay actividades registradas" 
          : "No se encontraron actividades que coincidan con los filtros"
        )}
      />

      {/* Estadísticas */}
      {showStats && stats && <ActivityStats stats={stats} />}
    </Stack>
  );
};