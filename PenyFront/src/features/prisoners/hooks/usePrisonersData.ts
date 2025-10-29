import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import type { PrisonerBase } from '../../../shared/types/prisonerTypes';
import { prisonersService } from '../../../shared/services/prisonersService';

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

export const usePrisonersData = () => {
  const [prisoners, setPrisoners] = useState<(PrisonerBase & { fullName?: string })[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    activos: 0,
    trasladados: 0,
    liberados: 0,
    archivados: 0,
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

      const response = await prisonersService.getPrisoners({
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
    const allPrisoners = await prisonersService.getPrisoners({ limit: 1000 });

    const stats = {
      total: allPrisoners.data.length,
      activos: allPrisoners.data.filter((p: PrisonerBase) => p.status === "Activo").length,
      trasladados: allPrisoners.data.filter((p: PrisonerBase) => p.status === "Trasladado").length,
      liberados: allPrisoners.data.filter((p: PrisonerBase) => p.status === "Liberado").length,
      archivados: allPrisoners.data.filter((p: PrisonerBase) => p.status === "Archivado").length,
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