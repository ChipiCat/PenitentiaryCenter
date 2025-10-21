import React from 'react';
import { Badge } from '@mantine/core';

export type ActionType = 'login' | 'create' | 'update' | 'export' | 'delete' | 'view' | 'print';

export interface ActionBadgeProps {
  type: ActionType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'light' | 'filled' | 'outline';
}

export const ActionBadge: React.FC<ActionBadgeProps> = ({
  type,
  size = 'sm',
  variant = 'light'
}) => {
  const getActionConfig = (actionType: ActionType) => {
    switch (actionType) {
      case 'login':
        return { color: 'blue', label: 'Login' };
      case 'create':
        return { color: 'green', label: 'Crear' };
      case 'update':
        return { color: 'purple', label: 'Actualizar' };
      case 'export':
        return { color: 'orange', label: 'Exportar' };
      case 'delete':
        return { color: 'red', label: 'Eliminar' };
      case 'view':
        return { color: 'cyan', label: 'Ver' };
      case 'print':
        return { color: 'pink', label: 'Imprimir' };
      default:
        return { color: 'gray', label: 'Acción' };
    }
  };

  const { color, label } = getActionConfig(type);

  return (
    <Badge size={size} color={color} variant={variant}>
      {label}
    </Badge>
  );
};