import React from 'react';
import { TrendingUp, Users, FileText, UserPlus } from 'lucide-react';
import { StatsGrid } from '../../../shared/components/analytics/StatsGrid';
import type { StatCardData } from '../../../shared/components/analytics/MetricCard';

interface SystemActivityStatsProps {
  period?: 'today' | 'week' | 'month' | 'year';
}

export const SystemActivityStats: React.FC<SystemActivityStatsProps> = ({ 
  period = 'today' 
}) => {
  const getStatsForPeriod = (timePeriod: string): StatCardData[] => {
    switch (timePeriod) {
      case 'week':
        return [
          {
            title: 'Acciones Esta Semana',
            value: 324,
            subtitle: '↑ 45 vs semana anterior',
            color: 'purple',
            icon: <TrendingUp size={20} />
          },
          {
            title: 'Usuarios Únicos',
            value: 12,
            subtitle: 'Activos esta semana',
            color: 'green',
            icon: <Users size={20} />
          },
          {
            title: 'Reportes Generados',
            value: 8,
            subtitle: 'Esta semana',
            color: 'pink',
            icon: <FileText size={20} />
          },
          {
            title: 'Nuevos Registros',
            value: 15,
            subtitle: 'Esta semana',
            color: 'orange',
            icon: <UserPlus size={20} />
          }
        ];
      case 'month':
        return [
          {
            title: 'Acciones Este Mes',
            value: 1250,
            subtitle: '↑ 180 vs mes anterior',
            color: 'purple',
            icon: <TrendingUp size={20} />
          },
          {
            title: 'Usuarios Únicos',
            value: 18,
            subtitle: 'Activos este mes',
            color: 'green',
            icon: <Users size={20} />
          },
          {
            title: 'Reportes Generados',
            value: 42,
            subtitle: 'Este mes',
            color: 'pink',
            icon: <FileText size={20} />
          },
          {
            title: 'Nuevos Registros',
            value: 156,
            subtitle: 'Este mes',
            color: 'orange',
            icon: <UserPlus size={20} />
          }
        ];
      default: // today
        return [
          {
            title: 'Acciones Hoy',
            value: 47,
            subtitle: '↑ 12 vs ayer',
            color: 'purple',
            icon: <TrendingUp size={20} />
          },
          {
            title: 'Usuarios Activos',
            value: 3,
            subtitle: 'En línea ahora',
            color: 'green',
            icon: <Users size={20} />
          },
          {
            title: 'Reportes Generados',
            value: 8,
            subtitle: 'Hoy',
            color: 'pink',
            icon: <FileText size={20} />
          },
          {
            title: 'Nuevos Registros',
            value: 15,
            subtitle: 'Hoy',
            color: 'orange',
            icon: <UserPlus size={20} />
          }
        ];
    }
  };

  const stats = getStatsForPeriod(period);

  return (
    <StatsGrid 
      stats={stats} 
      columns={{ base: 12, sm: 6, lg: 3 }}
      cardSize="md"
    />
  );
};