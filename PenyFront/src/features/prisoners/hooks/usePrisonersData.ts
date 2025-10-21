import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { prisonersApi, type PrisonerBase } from '../../../shared/services/prisonersApi';

interface Statistics {
  total: number;
  activos: number;
  preventivos: number;
  condenados: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const usePrisonersData = () => {
  const [prisoners, setPrisoners] = useState<(PrisonerBase & { fullName?: string })[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    activos: 0,
    preventivos: 0,
    condenados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await prisonersApi.getPrisonersWithNames({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
      });

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
  }, [pagination.page, pagination.limit, statusFilter, searchTerm]);

  const loadStats = useCallback(async () => {
    try {
      const allPrisoners = await prisonersApi.getPrisoners({ limit: 1000 });

      const stats = {
        total: allPrisoners.data.length,
        activos: allPrisoners.data.filter((p) => p.status === "Activo").length,
        preventivos: allPrisoners.data.filter((p) => p.status === "Activo").length,
        condenados: allPrisoners.data.filter((p) => p.status === "Liberado").length,
      };

      setStatistics(stats);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  }, []);

  return {
    prisoners,
    statistics,
    loading,
    statusFilter,
    searchTerm,
    pagination,
    setStatusFilter,
    setSearchTerm,
    setPagination,
    loadData,
    loadStats,
  };
};