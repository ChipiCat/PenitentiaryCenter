import React, { useState, useCallback, useEffect } from "react";
import { Container, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { PrisonerFormWizard } from "../components/forms/PrisonerFormWizard";
import { ROUTES } from "../../../shared/config/routes";
import { PrisonersHeader } from "../components/list/PrisonersHeader";
import { PrisonersStats } from "../components/list/PrisonersStats";
import { PrisonersList } from "../components/list/PrisonersList";
import { EmptyPrisonersState } from "../components/list/EmptyPrisonersState";
import { PrisonersSearchBar } from "../components/list/PrisonersSearchBar";
import { PrisonersFilters } from "../components/list/PrisonersFilters";
import { PrisonersPagination } from "../components/list/PrisonersPagination";
import type { PrisionerListItem, PrisonerBase } from "../../../shared/types/prisonerTypes";
import type { UserFilters } from "../../../shared/types";
import { prisonersService } from "../../../shared/services/prisonersService";

type ViewMode = "list" | "create" | "edit";

interface Statistics {
  total: number;
  activos: number;
  trasladados: number;
  liberados: number;
  archivados: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const PrisonersPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPrisoner, setSelectedPrisoner] = useState<PrisonerBase | null>(
    null
  );
  const [prisoners, setPrisoners] = useState<
    PrisionerListItem[]
  >([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    activos: 0,
    trasladados: 0,
    liberados: 0,
    archivados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<UserFilters>({});
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const handleCreateNew = () => {
    setSelectedPrisoner(null);
    setViewMode("create");
  };

  const handleEdit = (prisoner: PrisonerBase) => {
    setSelectedPrisoner(prisoner);
    setViewMode("edit");
  };

  const handleViewProfile = (prisoner: PrisonerBase) => {
    console.log("🔍 Navegando al perfil de:", prisoner.id);
    navigate(ROUTES.PRISONER_PROFILE.replace(":id", prisoner.id));
  };

  const handleSuccess = (result: { prisoner: PrisonerBase; id: string }) => {
    console.log("Prisionero guardado:", result.prisoner);
    setViewMode("list");
    loadData();
    loadStats();
  };

  const handleCancel = () => {
    setViewMode("list");
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await prisonersService.getAllPrisoners(
        pagination.page,
        pagination.limit,
        searchQuery,
        filters,
        false,
        'admissionDate',
        'desc'
      );
      setPrisoners(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error cargando prisioneros:", error);
      notifications.show({
        title: "Error",
        message: "No se pudieron cargar los prisioneros",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, filters]);

  const loadStats = useCallback(async () => {
    try {
      const allPrisoners = await prisonersService.getPrisoners({ limit: 1000 });

      const stats = {
        total: allPrisoners.data.length,
        activos: allPrisoners.data.filter(
          (p: PrisonerBase) => p.status === "Activo"
        ).length,
        trasladados: allPrisoners.data.filter(
          (p: PrisonerBase) => p.status === "Trasladado"
        ).length,
        liberados: allPrisoners.data.filter(
          (p: PrisonerBase) => p.status === "Liberado"
        ).length,
        archivados: allPrisoners.data.filter(
          (p: PrisonerBase) => p.status === "Archivado"
        ).length,
      };

      setStatistics(stats);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadStats();
  }, [loadData, loadStats]);

  // Handlers para búsqueda y filtros
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: UserFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  if (viewMode === "create" || viewMode === "edit") {
    return (
      <PrisonerFormWizard
        mode={viewMode}
        initialData={selectedPrisoner || undefined}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Container size="xl" className="!mt-1">
      <Stack gap="lg">
        <PrisonersHeader onCreateNew={handleCreateNew} />
        <PrisonersStats statistics={statistics} />
        
        {/* Barra de búsqueda */}
        <PrisonersSearchBar onSearch={handleSearch} />
        
        {/* Filtros */}
        <PrisonersFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
        
        {prisoners.length === 0 && !loading ? (
          <EmptyPrisonersState onCreateNew={handleCreateNew} />
        ) : (
          <>
            <PrisonersList
              prisoners={prisoners}
              onViewProfile={handleViewProfile}
              onEdit={handleEdit}
              loading={loading}
            />
            
            {/* Paginación */}
            <PrisonersPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              pageSize={pagination.limit}
              total={pagination.total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </Stack>
    </Container>
  );
};
