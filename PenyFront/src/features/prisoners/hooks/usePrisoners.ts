import { useState, useMemo } from 'react';
import type { Prisoner } from '../utils/types';
import mockData from '../utils/mockData.json';

export const usePrisoners = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  // En el futuro, esto podría venir de una API
  const allPrisoners: Prisoner[] = mockData.prisoners as Prisoner[];

  const filteredPrisoners = useMemo(() => {
    let filtered = allPrisoners;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        prisoner =>
          prisoner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prisoner.idNumber.includes(searchTerm)
      );
    }

    // Filtrar por estado
    if (statusFilter) {
      filtered = filtered.filter(prisoner => prisoner.status === statusFilter);
    }

    return filtered;
  }, [searchTerm, statusFilter, allPrisoners]);

  // Paginación
  const totalPages = Math.ceil(filteredPrisoners.length / itemsPerPage);
  const paginatedPrisoners = filteredPrisoners.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    activePage,
    setActivePage,
    filteredPrisoners,
    paginatedPrisoners,
    totalPages,
    itemsPerPage
  };
};