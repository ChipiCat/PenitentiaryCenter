import api from "./api";
import type { ActivityLog, ActivityLogsPagination, ActivityLogsResponse } from "../types/activityLogTypes";

export async function fetchActivityLogs() {
  try {
    const res = await api.get<ActivityLogsResponse>("/audit/activity-logs");
    return res.data.data;
  } catch (err) {
    console.error("Error al obtener logs de actividad:", err);
    return [];
  }
}

export const fetchPrisonerTimeline = async (
  params: {
    prisonerId: string;
    module?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
    limit: number;
    page: number;
  }
): Promise<{
  events: ActivityLog[];
  pagination: ActivityLogsPagination;
}> => {
  const queryParams: Record<string, string | number | undefined> = {
    module: params.module,
    action: params.action,
    start_date: params.start_date,
    end_date: params.end_date,
    limit: params.limit,
    page: params.page,
  };
  try {
    const res = await api.get(`/audit/prisoner/${params.prisonerId}/timeline`, { params: queryParams });
    return res.data;
  } catch (err) {
    console.error("Error al obtener timeline de prisionero:", err);
    return { events: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 1, has_next: false, has_prev: false } };
  }
};
