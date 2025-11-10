import { useEffect, useState } from "react";
import type { ActivityLog } from "../../../shared/types/activityLogTypes";
import { fetchActivityLogs } from "../../../shared/services/auditService";

export function useSystemActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const data = await fetchActivityLogs();
        setActivities(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar actividades");
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const filteredActivities = activities.filter(a =>
    (!actionFilter || a.action === actionFilter) &&
    (!searchTerm || a.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return {
    activities,
    actionFilter,
    setActionFilter,
    timeFilter,
    setTimeFilter,
    searchTerm,
    setSearchTerm,
    filteredActivities,
    loading,
    error,
  };
}