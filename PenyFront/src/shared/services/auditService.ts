import api from "./api";
import type { ActivityLogsResponse } from "../types/activityLogTypes";

export async function fetchActivityLogs() {
  try {
    const res = await api.get<ActivityLogsResponse>("/audit/activity-logs");
    return res.data.data;
  } catch (err) {
    console.error("Error al obtener logs de actividad:", err);
    return [];
  }
}

export async function fetchPrisonerTimeline({
  prisonerId,
  module,
  action,
  start_date,
  end_date,
  limit,
  page
}: {
  prisonerId: string;
  module?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  limit: number;
  page: number;
}) {
  const params: Record<string, any> = {
    ...(module && { module }),
    ...(action && { action }),
    ...(start_date && { start_date }),
    ...(end_date && { end_date }),
    limit,
    page
  };
  try {
    const res = await api.get(`/audit/prisoner/${prisonerId}/timeline`, { params });
    return res.data;
  } catch (err) {
    console.error("Error al obtener timeline de prisionero:", err);
    return null;
  }
}
