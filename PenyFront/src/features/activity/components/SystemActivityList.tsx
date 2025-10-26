import React from 'react';
import { ActivityList } from '../../../shared/components/activity/ActivityList';
import type { ActivityRecordData } from '../../../shared/components/activity/ActivityRecord';
import type { ActivityUser } from '../../../shared/types/activityLogTypes';

interface SystemActivityListProps {
  activities: ActivityRecordData[];
  onUserClick?: (user: ActivityUser) => void;
  onTargetClick?: (target: string) => void;
}

export const SystemActivityList: React.FC<SystemActivityListProps> = ({
  activities,
  onUserClick,
  onTargetClick
}) => {
  const handleUserClick = (user: ActivityUser) => {
    console.log('Clicked on user:', user);
    onUserClick?.(user);
    // Aquí podrías abrir un modal con detalles del usuario
    // o navegar a su perfil
  };

  const handleTargetClick = (target: string) => {
    console.log('Clicked on target:', target);
    onTargetClick?.(target);
    // Aquí podrías navegar al registro específico
    // o mostrar más detalles
  };

  return (
    <ActivityList
      title="Registro de Actividades"
      activities={activities}
      emptyMessage="No hay actividades del sistema registradas"
      onUserClick={handleUserClick}
      onTargetClick={handleTargetClick}
      maxHeight="600px"
    />
  );
};