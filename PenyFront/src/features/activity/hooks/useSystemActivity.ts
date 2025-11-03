import { useEffect, useState } from "react";
import type { ActivityLog } from "../../../shared/types/activityLogTypes";
import { fetchActivityLogs } from "../../../shared/services/auditService";

export function useSystemActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchActivityLogs().then(setActivities);
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