import React, { useState, useCallback, useEffect } from "react";
import { Container, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { PrisonersHeader } from "../components/list/PrisonersHeader";
import { PrisonersStats } from "../components/list/PrisonersStats";
import { PrisonersList } from "../components/list/PrisonersList";
import { EmptyPrisonersState } from "../components/list/EmptyPrisonersState";
import { PrisonersFilters } from "../components/list/PrisonersFilters";
import { ROUTES } from "../../../shared/config/routes";
import type {
  PrisionerListItem,
  PrisonerBase,
} from "../../../shared/types/prisonerTypes";
import type { Statistics, Pagination } from "../../../shared/types";
import type { PrisonerSearchFilters } from "../../../shared/types/prisonerSearchTypes";
import { prisonersService } from "../../../shared/services/prisonersService";
import PrisonersSearchBar from "../components/list/PrisonersSearchBar";
import { CustomPagination } from "../../../shared/components/CustomPagination";

export const PrisonersPage: React.FC = () => {
  const navigate = useNavigate();

  // State management
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
  const [filters, setFilters] = useState<PrisonerSearchFilters>({});
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [viewType, setViewType] = useState<"table" | "cards">("cards");

  // Memoized callback for viewing profile
  const handleViewProfile = useCallback(
    (prisoner: PrisonerBase) => {
      navigate(ROUTES.PRISONER_PROFILE.replace(":id", prisoner.id));
    },
    [navigate]
  );

  // Load prisoners data
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

  // Load statistics
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

  // Initial data load
  useEffect(() => {
    loadData();
    loadStats();
  }, [loadData, loadStats]);

  // Search handler - only updates state, debounce happens at page level
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Filters handlers
  const handleFiltersChange = useCallback(
    (newFilters: PrisonerSearchFilters) => {
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  // Create new prisoner handler
  const handleCreateNew = useCallback(() => {
    // Navigate to create page or open modal
    console.log("Create new prisoner");
  }, []);

  // Edit prisoner handler (stub for now)
  const handleEdit = useCallback(() => {
    console.log("Edit prisoner");
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
            onViewProfile={handleViewProfile}
            onEdit={handleEdit}
            loading={true}
            viewType={viewType === "cards" ? "card" : "table"}
          />
        ) : prisoners?.length === 0 ? (
          <EmptyPrisonersState onCreateNew={handleCreateNew} />
        ) : (
          <>
            <PrisonersList
              prisoners={prisoners}
              onViewProfile={handleViewProfile}
              onEdit={handleEdit}
              loading={false}
              viewType={viewType === "cards" ? "card" : "table"}
            />
            <CustomPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              pageSize={pagination.limit}
              total={pagination.total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[12, 24, 50, 100]}
            />
          </>
        )}
      </Stack>
    </Container>
  );
};
