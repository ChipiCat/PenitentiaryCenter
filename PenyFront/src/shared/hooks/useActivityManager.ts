import { useState, useMemo } from 'react';
import type { ActivityItem, ActivityStat } from '../components/activity/ActivitySection';

export interface UseActivityManagerProps {
  entityId: string;
  activities: ActivityItem[];
  getStats?: (activities: ActivityItem[]) => ActivityStat[];
}

export const useActivityManager = ({
  entityId,
  activities,
  getStats
}: UseActivityManagerProps) => {
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

  return {
    // Estado
    filterType,
    setFilterType,
    searchTerm,
    setSearchTerm,
    
    // Datos procesados
    entityActivities,
    filteredActivities,
    stats
  };
};