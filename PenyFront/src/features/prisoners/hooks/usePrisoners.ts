import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import mockData from '../utils/mockData.json';
import { ROUTES } from '../../../shared/config/routes';
import type { Prisoner, PrisonerStats, PrisonerStatus } from '../types';

// Tipo para datos raw del JSON
interface RawPrisonerData {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  idNumber?: string;
  identification?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  lastUpdate?: string;
  photo?: string;
  age?: number;
  [key: string]: unknown;
}

export const usePrisoners = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // 🔧 Función para normalizar el status
  const normalizeStatus = (status: string | undefined): PrisonerStatus => {
    if (!status) return 'Activo';
    
    // Mapear diferentes variaciones al tipo correcto
    const statusMap: Record<string, PrisonerStatus> = {
      'activo': 'Activo',
      'Activo': 'Activo',
      'inactivo': 'Inactivo',
      'Inactivo': 'Inactivo',
      'en proceso': 'En Proceso',
      'En proceso': 'En Proceso',
      'En Proceso': 'En Proceso',
      'liberado': 'Liberado',
      'Liberado': 'Liberado',
      'transferido': 'Transferido',
      'Transferido': 'Transferido'
    };
    
    return statusMap[status] || 'Activo';
  };

  // 🔧 Datos con transformación para asegurar campos requeridos
  const allPrisoners = useMemo(() => {
    return (mockData.prisoners as RawPrisonerData[]).map((prisoner): Prisoner => {
      const currentDate = new Date().toISOString();
      
      return {
        ...prisoner,
        id: prisoner.id,
        fullName: prisoner.fullName || `${prisoner.firstName || ''} ${prisoner.lastName || ''}`.trim(),
        idNumber: prisoner.idNumber || prisoner.identification || '',
        age: prisoner.age || 0, // 🔧 Asegurar que age tenga un valor
        status: normalizeStatus(prisoner.status), // 🔧 Normalizar status
        createdAt: prisoner.createdAt || currentDate,
        updatedAt: prisoner.updatedAt || currentDate,
        lastUpdate: prisoner.lastUpdate || prisoner.updatedAt || currentDate,
        photo: prisoner.photo || undefined,
      };
    });
  }, []);

  // Filtros
  const filteredPrisoners = useMemo(() => {
    let filtered = allPrisoners;
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.idNumber?.includes(searchTerm)
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    return filtered;
  }, [allPrisoners, searchTerm, statusFilter]);

  // Paginación
  const paginatedPrisoners = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return filteredPrisoners.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPrisoners, activePage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPrisoners.length / itemsPerPage);

  // Estadísticas
  const stats: PrisonerStats = useMemo(() => ({
    total: allPrisoners.length,
    active: allPrisoners.filter(p => p.status === 'Activo').length,
    inProcess: allPrisoners.filter(p => p.status === 'En Proceso').length,
    released: allPrisoners.filter(p => p.status === 'Liberado').length
  }), [allPrisoners]);

  // Funciones
  const handleNewPrisoner = useCallback(() => {
    navigate(ROUTES.PRISONERS_NEW);
  }, [navigate]);

  const handleViewPrisoner = useCallback((id: string) => {
    navigate(`${ROUTES.PRISONERS}/${id}`);
  }, [navigate]);

  const handleEditPrisoner = useCallback((id: string) => {
    navigate(`${ROUTES.PRISONERS}/${id}/edit`);
  }, [navigate]);

  const handleDeletePrisoner = useCallback(async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'Recluso eliminado',
        message: 'El expediente ha sido eliminado correctamente',
        color: 'red'
      });

      console.log(`Eliminar recluso con ID: ${id}`);
    } catch {
      notifications.show({
        title: 'Error al eliminar',
        message: 'No se pudo eliminar el expediente',
        color: 'red'
      });
    }
  }, []);

  const handleDownloadPrisoner = useCallback((id: string, format: 'pdf' | 'excel' = 'pdf') => {
    try {
      const prisoner = allPrisoners.find(p => p.id === id);
      if (!prisoner) {
        throw new Error('Recluso no encontrado');
      }

      notifications.show({
        title: 'Descarga iniciada',
        message: `Descargando expediente de ${prisoner.fullName} en formato ${format.toUpperCase()}`,
        color: 'blue'
      });

      console.log(`Descargar recluso ${id} en formato ${format}`);
    } catch {
      notifications.show({
        title: 'Error en la descarga',
        message: 'No se pudo descargar el expediente',
        color: 'red'
      });
    }
  }, [allPrisoners]);

  const getPrisonerById = useCallback((id: string): Prisoner | null => {
    return allPrisoners.find(p => p.id === id) || null;
  }, [allPrisoners]);

  return {
    searchTerm, 
    setSearchTerm,
    statusFilter, 
    setStatusFilter,
    activePage, 
    setActivePage,
    
    prisoners: paginatedPrisoners,
    allPrisoners,
    filteredPrisoners,
    paginatedPrisoners,
    totalPages,
    stats,
    loading,

    handleNewPrisoner,
    handleViewPrisoner,
    handleEditPrisoner,
    handleDeletePrisoner,
    handleDownloadPrisoner,
    getPrisonerById
  };
};