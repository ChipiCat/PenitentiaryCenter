import React, { useState, useCallback, useEffect, startTransition, useDeferredValue } from "react";
import { Container, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { PrisonerFormWizard } from "../components/forms/PrisonerFormWizard";
import { ROUTES } from "../../../shared/config/routes";
import { PrisonersHeader } from "../components/list/PrisonersHeader";
import { PrisonersStats } from "../components/list/PrisonersStats";
import { PrisonersList } from "../components/list/PrisonersList";
import { EmptyPrisonersState } from "../components/list/EmptyPrisonersState";
import { PrisonersFilters } from "../components/list/PrisonersFilters";
import { PrisonersPagination } from "../components/list/PrisonersPagination";
import type {
  PrisionerListItem,
  PrisonerBase,
} from "../../../shared/types/prisonerTypes";
import type { UserFilters, Statistics, Pagination } from "../../../shared/types";
import { prisonersService } from "../../../shared/services/prisonersService";
import PrisonersSearchBar from "../components/list/PrisonersSearchBar";


export const PrisonersPage: React.FC = () => {
  const navigate = useNavigate();
  const [prisoners, setPrisoners] = useState<PrisionerListItem[]>([]);
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
  const [viewType, setViewType] = useState<'table' | 'cards'>('cards');



  const handleViewProfile = useCallback((prisoner: PrisonerBase) => {
    console.log("🔍 Navegando al perfil de:", prisoner.id);
    navigate(ROUTES.PRISONER_PROFILE.replace(":id", prisoner.id));
  }, [navigate]);



  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await prisonersService.getAllPrisoners(
        pagination.page,
        pagination.limit,
        searchQuery,
        filters,
        false,
        "admissionDate",
        "desc"
      );
      console.log("Datos de prisioneros cargados:", response);
      // Update large state inside a transition so rendering stays responsive
      
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
        total: allPrisoners.data?.length ?? 0,
        activos: allPrisoners.data?.filter(
          (p: PrisonerBase) => p.status === "Activo"
        ).length,
        trasladados: allPrisoners.data?.filter(
          (p: PrisonerBase) => p.status === "Trasladado"
        ).length,
        liberados: allPrisoners.data?.filter(
          (p: PrisonerBase) => p.status === "Liberado"
        ).length,
        archivados: allPrisoners.data?.filter(
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

  // use a deferred value for prisoners to avoid blocking urgent UI updates
  const deferredPrisoners = useDeferredValue(prisoners);

  // Handlers para búsqueda y filtros
  const handleSearch = useCallback((query: string) => {
    // mark the search update as low-priority to avoid blocking urgent UI work
    startTransition(() => {
      setSearchQuery(query);
      setPagination((prev) => ({ ...prev, page: 1 }));
    });
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

  return (
    <Container size="xl" className="!mt-1">
      <Stack gap="lg">
        <PrisonersHeader viewType={viewType} onViewChange={setViewType} />
        <PrisonersStats statistics={statistics} />
        <PrisonersSearchBar onSearch={handleSearch} />

        <PrisonersFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {loading ? (
          <PrisonersList
            prisoners={[]}
            onViewProfile={() => {}}
            onEdit={() => {}}
            loading={true}
            viewType={viewType === 'cards' ? 'card' : 'table'}
          />
        ) : prisoners?.length === 0 ? (
          <EmptyPrisonersState onCreateNew={() => {}} />
        ) : (
          <>
            <PrisonersList
              prisoners={deferredPrisoners}
              onViewProfile={handleViewProfile}
              onEdit={() => {}}
              loading={false}
              viewType={viewType === 'cards' ? 'card' : 'table'}
            />
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
