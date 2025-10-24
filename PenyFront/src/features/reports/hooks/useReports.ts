import { useState } from 'react';
import type { ReportFilters, SystemStat, ReportType } from '../../../shared/types/report/reportTypes';
import { Users, UserCheck, Scale, CheckCircle, FileText, Shield, Activity, Heart } from 'lucide-react';

export const useReports = () => {
  // Estados para los filtros
  const [filters, setFilters] = useState<ReportFilters>({
    crimeType: null,
    processStatus: null,
    gender: null,
    minAge: '',
    maxAge: '',
    startDate: '',
    endDate: '',
  });

  // Estadísticas del sistema
  const systemStats: SystemStat[] = [
    {
      title: 'Total Internos',
      value: '847',
      change: '+12 este mes',
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Internos Activos',
      value: '823',
      change: '+8 este mes',
      changeType: 'positive', 
      icon: UserCheck,
      color: 'green'
    },
    {
      title: 'En Proceso Legal',
      value: '156',
      change: '-3 este mes',
      changeType: 'negative',
      icon: Scale,
      color: 'yellow'
    },
    {
      title: 'Liberaciones',
      value: '24',
      change: '+5 este mes',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'purple'
    }
  ];

  // Función para generar reportes
  const handleGenerateReport = (reportType: string) => {
    console.log('Generando reporte:', reportType);
    console.log('Filtros aplicados:', filters);
    // Aquí implementarías la lógica para generar y descargar el reporte
  };

  // Tipos de reportes disponibles
  const reportTypes: ReportType[] = [
    {
      id: 'population',
      title: 'Reporte de Población',
      description: 'Estadísticas generales de internos',
      icon: FileText,
      color: 'violet',
      action: () => handleGenerateReport('population')
    },
    {
      id: 'legal',
      title: 'Reporte Legal',
      description: 'Estado de procesos judiciales',
      icon: Shield,
      color: 'green',
      action: () => handleGenerateReport('legal')
    },
    {
      id: 'monthly',
      title: 'Reporte Mensual',
      description: 'Resumen mensual completo',
      icon: Activity,
      color: 'violet',
      action: () => handleGenerateReport('monthly')
    },
    {
      id: 'medical',
      title: 'Reporte Médico',
      description: 'Estado de salud de internos',
      icon: Heart,
      color: 'red',
      action: () => handleGenerateReport('medical')
    }
  ];

  // Función para exportar a Excel
  const handleExportToExcel = () => {
    console.log('Exportando a Excel con filtros personalizados');
    handleGenerateReport('custom');
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      crimeType: null,
      processStatus: null,
      gender: null,
      minAge: '',
      maxAge: '',
      startDate: '',
      endDate: '',
    });
  };

  // Handlers para cambiar filtros
  const filtersHandlers = {
    setCrimeType: (value: string | null) => setFilters(prev => ({ ...prev, crimeType: value })),
    setProcessStatus: (value: string | null) => setFilters(prev => ({ ...prev, processStatus: value })),
    setGender: (value: string | null) => setFilters(prev => ({ ...prev, gender: value })),
    setMinAge: (value: number | string) => setFilters(prev => ({ ...prev, minAge: value })),
    setMaxAge: (value: number | string) => setFilters(prev => ({ ...prev, maxAge: value })),
    setStartDate: (value: string) => setFilters(prev => ({ ...prev, startDate: value })),
    setEndDate: (value: string) => setFilters(prev => ({ ...prev, endDate: value })),
  };

  return {
    filters,
    systemStats,
    reportTypes,
    filtersHandlers,
    handleExportToExcel,
    handleClearFilters,
  };
};