import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import mockData from '../utils/mockData.json';
import { ROUTES } from '../../../shared/config/routes';

export const usePrisoners = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  // Simular carga
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Datos directos del JSON
  const allPrisoners = useMemo(() => mockData.prisoners as any[], []);

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
  const stats = useMemo(() => ({
    total: allPrisoners.length,
    active: allPrisoners.filter(p => p.status === 'Activo').length,
    inProcess: allPrisoners.filter(p => p.status === 'En Proceso').length,
    released: allPrisoners.filter(p => p.status === 'Liberado').length
  }), [allPrisoners]);

  // 🆕 Funciones de navegación y acciones
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
    } catch (error) {
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
    } catch (error) {
      notifications.show({
        title: 'Error en la descarga',
        message: 'No se pudo descargar el expediente',
        color: 'red'
      });
    }
  }, [allPrisoners]);

  // 🆕 Función para obtener un recluso por ID
  const getPrisonerById = useCallback((id: string) => {
    return allPrisoners.find(p => p.id === id) || null;
  }, [allPrisoners]);

  return {
    // Estados de filtro
    searchTerm, 
    setSearchTerm,
    statusFilter, 
    setStatusFilter,
    activePage, 
    setActivePage,
    
    // 🔧 Datos (incluir filteredPrisoners)
    prisoners: paginatedPrisoners,
    allPrisoners,
    filteredPrisoners, // 🆕 Agregar esta propiedad
    paginatedPrisoners,
    totalPages,
    stats,
    loading,

    // 🔧 Funciones de acción (incluir getPrisonerById)
    handleNewPrisoner,
    handleViewPrisoner,
    handleEditPrisoner,
    handleDeletePrisoner,
    handleDownloadPrisoner,
    getPrisonerById // 🆕 Agregar esta función
  };
};