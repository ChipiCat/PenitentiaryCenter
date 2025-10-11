import { Container, Stack } from '@mantine/core';
import { useState } from 'react';
import type { ViewMode } from '../types';
import { usePrisoners } from '../hooks/usePrisoners'; 
import { PrisonersHeader } from '../components/PrisonersHeader';
import { PrisonersControls } from '../components/PrisonersControls';
import { PrisonersTable } from '../components/PrisonersTable';
import { PrisonersCards } from '../components/PrisonersCards';
import { EmptyState } from '../components/EmptyState';

const PrisonersPage = () => {
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
    totalPages,
    handleNewPrisoner,
    handleViewPrisoner,
    handleEditPrisoner,
    handleDeletePrisoner,
    handleDownloadPrisoner
  } = usePrisoners(); 

  const hasFilters = Boolean(searchTerm || statusFilter);

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