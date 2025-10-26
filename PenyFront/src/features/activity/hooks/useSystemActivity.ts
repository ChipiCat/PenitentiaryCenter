import { useEffect, useState } from "react";
import api from "../../../shared/services/api";
import type { ActivityLog, ActivityLogsResponse } from "../../../shared/types/activityLogTypes";

export function useSystemActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    api.get<ActivityLogsResponse>("/audit/activity-logs")
      .then(res => setActivities(res.data.data))
      .catch(err => {
        console.error("Error al obtener logs de actividad:", err);
        setActivities([]);
      });
  }, []);

  const filteredActivities = activities.filter(a =>
    (!actionFilter || a.action === actionFilter) &&
    (!searchTerm || a.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return {
    actionFilter,
    setActionFilter,
    timeFilter,
    setTimeFilter,
    searchTerm,
    setSearchTerm,
    filteredActivities
  };
}