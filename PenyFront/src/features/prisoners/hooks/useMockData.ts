import { useState, useEffect, useMemo } from 'react';
import mockData from '../utils/mockData.json';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  photoUrl: string | null;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
}

export interface Prisoner {
  id: string;
  fullName: string;
  idNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  admissionDate: string;
  age: number;
  birthDate: string;
  gender: string;
  nationality: string;
  crime: string;
  sentence: string;
  remainingSentence: string;
  cellBlock: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };
  legalStatus: string;
  behavior: string;
  workAssignment: string | null;
  medicalInfo: {
    bloodType: string;
    allergies: string;
    medications: string[];
    lastCheckup: string;
  };
  releaseDate?: string;
}

export interface Activity {
  id: string;
  userId: string;
  user: {
    name: string;
    role: string;
    avatar: string | null;
  };
  action: string;
  target: string;
  targetId?: string;
  description: string;
  timestamp: string;
  type: string;
  metadata?: Record<string, any>;
}

export interface DashboardStat {
  id: string;
  title: string;
  value: number;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
  color: string;
  lastUpdated: string;
}

export interface ActivityStat {
  id: string;
  title: string;
  value: number;
  subtitle: string;
  color: string;
  icon: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  generatedBy: string;
  generatedAt: string;
  type: string;
  format: string;
  recordCount: number;
  status: string;
}

export interface SystemInfo {
  version: string;
  lastUpdate: string;
  maintenance: boolean;
  settings: {
    maxInmates: number;
    allowedFileTypes: string[];
    sessionTimeout: number;
    backupFrequency: string;
  };
}

export interface MockDataType {
  users: User[];
  prisoners: Prisoner[];
  activities: Activity[];
  statistics: {
    dashboard: DashboardStat[];
    activity: ActivityStat[];
  };
  reports: Report[];
  system: SystemInfo;
}

// 🆕 Funciones de validación y conversión
const validateChangeType = (changeType: string): 'positive' | 'negative' => {
  return changeType === 'positive' || changeType === 'negative' ? changeType : 'positive';
};

const convertDashboardStat = (stat: any): DashboardStat => ({
  id: stat.id || '',
  title: stat.title || '',
  value: Number(stat.value) || 0,
  change: stat.change || '',
  changeType: validateChangeType(stat.changeType),
  icon: stat.icon || '',
  color: stat.color || 'blue',
  lastUpdated: stat.lastUpdated || new Date().toISOString()
});

const convertActivityStat = (stat: any): ActivityStat => ({
  id: stat.id || '',
  title: stat.title || '',
  value: Number(stat.value) || 0,
  subtitle: stat.subtitle || '',
  color: stat.color || 'blue',
  icon: stat.icon || ''
});

export const useMockData = () => {
  const [data, setData] = useState<MockDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Validar datos básicos
        if (!mockData.users || !mockData.prisoners || !mockData.activities) {
          throw new Error('Datos mockeados incompletos');
        }
        
        // 🆕 Conversión segura con validación y tipado correcto
        const validatedData: MockDataType = {
          users: mockData.users.map(user => ({
            ...user,
            photoUrl: user.photoUrl || null
          })),
          prisoners: mockData.prisoners.map(prisoner => ({
            ...prisoner,
            workAssignment: prisoner.workAssignment || null,
            releaseDate: prisoner.releaseDate || undefined
          })),
          activities: mockData.activities.map(activity => ({
            ...activity,
            user: {
              ...activity.user,
              avatar: activity.user.avatar || null
            }
          })),
          statistics: {
            // 🆕 Validar y convertir estadísticas del dashboard
            dashboard: (mockData.statistics?.dashboard || []).map(convertDashboardStat),
            // 🆕 Validar y convertir estadísticas de actividad
            activity: (mockData.statistics?.activity || []).map(convertActivityStat)
          },
          reports: mockData.reports || [],
          system: mockData.system || {
            version: '1.0.0',
            lastUpdate: new Date().toISOString(),
            maintenance: false,
            settings: {
              maxInmates: 1000,
              allowedFileTypes: ['pdf', 'doc', 'docx'],
              sessionTimeout: 3600,
              backupFrequency: 'daily'
            }
          }
        };
        
        setData(validatedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error loading mock data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};

// 🆕 Hook específico para reclusos
export const usePrisoners = () => {
  const { data, loading, error } = useMockData();
  
  const prisoners = useMemo(() => data?.prisoners || [], [data]);
  
  const stats = useMemo(() => {
    const total = prisoners.length;
    const active = prisoners.filter(p => p.status === 'Activo').length;
    const inProcess = prisoners.filter(p => p.status === 'En Proceso').length;
    const released = prisoners.filter(p => p.status === 'Liberado').length;
    
    return { total, active, inProcess, released };
  }, [prisoners]);

  return {
    prisoners,
    stats,
    loading,
    error
  };
};

// 🆕 Hook específico para usuarios
export const useUsers = () => {
  const { data, loading, error } = useMockData();
  
  const users = useMemo(() => data?.users || [], [data]);
  
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'ACTIVO').length;
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, active, byRole };
  }, [users]);

  return {
    users,
    stats,
    loading,
    error
  };
};

// 🆕 Hook específico para actividades
export const useActivities = () => {
  const { data, loading, error } = useMockData();
  
  const activities = useMemo(() => data?.activities || [], [data]);
  
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = activities.filter(a => 
      a.timestamp.startsWith(today)
    ).length;
    
    const byType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { 
      total: activities.length, 
      today: todayActivities, 
      byType 
    };
  }, [activities]);

  return {
    activities,
    stats,
    loading,
    error
  };
};

// Hooks para estadísticas específicas con tipos correctos
export const useDashboardStats = () => {
  const { data, loading, error } = useMockData();
  return {
    stats: data?.statistics.dashboard || [],
    loading,
    error
  };
};

export const useActivityStats = () => {
  const { data, loading, error } = useMockData();
  return {
    stats: data?.statistics.activity || [],
    activities: data?.activities || [],
    loading,
    error
  };
};

export const useReports = () => {
  const { data, loading, error } = useMockData();
  return {
    reports: data?.reports || [],
    loading,
    error
  };
};

// 🆕 Hook para información del sistema
export const useSystemInfo = () => {
  const { data, loading, error } = useMockData();
  return {
    system: data?.system,
    loading,
    error
  };
};