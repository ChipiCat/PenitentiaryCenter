import { Container, Stack } from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { ViewMode } from './utils/types';
import { usePrisoners } from './hooks/usePrisoners';
import { PrisonersHeader } from './components/PrisonersHeader';
import { PrisonersControls } from './components/PrisonersControls';
import { PrisonersTable } from './components/PrisonersTable';
import { PrisonersCards } from './components/PrisonersCards';
import { EmptyState } from './components/EmptyState';

const PrisonersPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    activePage,
    setActivePage,
    filteredPrisoners,
    paginatedPrisoners,
    totalPages
  } = usePrisoners();

  // Funciones para las acciones
  const handleViewPrisoner = (id: string) => {
    console.log('Ver expediente:', id);
    // navigate(`/prisoners/${id}`);
  };

  const handleEditPrisoner = (id: string) => {
    console.log('Editar prisionero:', id);
    // navigate(`/prisoners/${id}/edit`);
  };

  const handleDeletePrisoner = (id: string) => {
    console.log('Eliminar prisionero:', id);
    // Mostrar modal de confirmación
  };

  const handleDownloadPrisoner = (id: string) => {
    console.log('Descargar expediente:', id);
    // Lógica para descargar PDF
  };

  const handleNewPrisoner = () => {
    console.log('Nuevo interno');
    // navigate('/prisoners/new');
  };

  const hasFilters = Boolean(searchTerm || statusFilter);

  // Componente de vista según el modo seleccionado
  const renderPrisonersView = () => {
    if (filteredPrisoners.length === 0) {
      return (
        <EmptyState
          hasFilters={hasFilters}
          onNewPrisoner={handleNewPrisoner}
        />
      );
    }

    const commonProps = {
      prisoners: paginatedPrisoners,
      totalPages,
      activePage,
      onPageChange: setActivePage,
      onViewPrisoner: handleViewPrisoner,
      onEditPrisoner: handleEditPrisoner,
      onDeletePrisoner: handleDeletePrisoner,
      onDownloadPrisoner: handleDownloadPrisoner
    };

    return viewMode === 'table' ? (
      <PrisonersTable {...commonProps} />
    ) : (
      <PrisonersCards {...commonProps} />
    );
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <PrisonersHeader />

        <PrisonersControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredPrisoners={filteredPrisoners}
          onNewPrisoner={handleNewPrisoner}
        />

        {renderPrisonersView()}
      </Stack>
    </Container>
  );
};

export default PrisonersPage;