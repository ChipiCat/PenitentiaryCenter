import React, { useState, useMemo } from 'react';
import { ActivitySection } from './ActivitySection';
import type { ActivityFilter } from './ActivityFilters';
import type { ActivityItem } from './ActivityTimeline';
import type { ActivityStat } from './ActivityStats';

export type { ActivityFilter, ActivityItem, ActivityStat };

export interface ActivityManagerProps {
  title: string;
  icon: React.JSX.Element;
  iconColor: string;
  entityId: string;
  entityLabel?: string;
  activities: ActivityItem[];
  filterOptions: ActivityFilter[];
  getIcon: (type: string) => React.JSX.Element;
  getColor: (type: string, status?: string) => string;
  getTypeLabel: (type: string) => string;
  getStats?: (activities: ActivityItem[]) => ActivityStat[];
  showStats?: boolean;
  emptyMessage?: string;
}

export const ActivityManager: React.FC<ActivityManagerProps> = ({
  title,
  icon,
  iconColor,
  entityId,
  entityLabel = "ID",
  activities,
  filterOptions,
  getIcon,
  getColor,
  getTypeLabel,
  getStats,
  showStats = true,
  emptyMessage
}) => {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar actividades específicas de la entidad
  const entityActivities = useMemo(() => 
    activities.filter(activity => activity.entityId === entityId),
    [activities, entityId]
  );

  // Aplicar filtros
  const filteredActivities = useMemo(() => {
    return entityActivities.filter(activity => {
      const matchesType = !filterType || activity.type === filterType;
      const matchesSearch = !searchTerm || 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  }, [entityActivities, filterType, searchTerm]);

  // Generar estadísticas
  const stats = useMemo(() => {
    return getStats ? getStats(entityActivities) : [];
  }, [entityActivities, getStats]);

  return (
    <ActivitySection
      title={title}
      icon={icon}
      iconColor={iconColor}
      entityInfo={`(${entityLabel}: ${entityId})`}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      filterType={filterType}
      onFilterChange={setFilterType}
      filterOptions={filterOptions}
      activities={entityActivities}
      filteredActivities={filteredActivities}
      getIcon={getIcon}
      getColor={getColor}
      getTypeLabel={getTypeLabel}
      emptyMessage={emptyMessage}
      stats={stats}
      showStats={showStats}
    />
  );
};