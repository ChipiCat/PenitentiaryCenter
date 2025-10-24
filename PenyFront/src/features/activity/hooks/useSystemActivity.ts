import { useState, useMemo } from "react";
import type { ActivityRecordData } from "../../../shared/components/activity/ActivityRecord";
import type { ActionType } from "../../../shared/components/activity/ActionBadge";

export const useSystemActivity = () => {
  const [actionFilter, setActionFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");

  const allActivities: ActivityRecordData[] = [
    {
      id: "1",
      user: {
        id: "u1", // ← agrega esto
        name: "María Elena Rodríguez",
        role: "@secretario",
        avatar: undefined,
      },
      action: "Ingresó al Sistema",
      target: "Sistema",
      description: "Inicio de sesión exitoso desde IP 192.168.1.45",
      timestamp: "2024-01-25 09:30:15",
      type: "login" as ActionType,
    },
    {
      id: "2",
      user: {
        id: "u2", // ← agrega esto
        name: "William García Vargas",
        role: "@director",
        avatar: undefined,
      },
      action: "Creó nuevo interno",
      target: "Juan Carlos Pérez",
      description: "Registro completo con información personal y legal",
      timestamp: "2024-01-25 09:15:22",
      type: "create" as ActionType,
    },
    {
      id: "3",
      user: {
        id: "u3", // ← agrega esto
        name: "Carlos Alberto Mendoza",
        role: "@secretario2",
        avatar: undefined,
      },
      action: "Actualizó expediente médico",
      target: "Ana Sofía Ramírez",
      description: "Agregó registro médico: Hipertensión arterial",
      timestamp: "2024-01-25 08:45:10",
      type: "update" as ActionType,
    },
    {
      id: "4",
      user: {
        id: "u1", // ← agrega esto (puede repetir si es el mismo usuario)
        name: "María Elena Rodríguez",
        role: "@secretario",
        avatar: undefined,
      },
      action: "Generó reporte mensual",
      target: "Reporte de Población",
      description: "Exportó 847 registros en formato Excel",
      timestamp: "2024-01-25 08:30:05",
      type: "export" as ActionType,
    },
  ];

  const filteredActivities = useMemo(() => {
    return allActivities.filter((activity) => {
      const matchesAction =
        actionFilter === "all" || activity.type === actionFilter;
      const matchesSearch =
        !searchTerm ||
        activity.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesAction && matchesSearch;
    });
  }, [allActivities, actionFilter, searchTerm]);

  return {
    actionFilter,
    setActionFilter,
    timeFilter,
    setTimeFilter,
    searchTerm,
    setSearchTerm,
    allActivities,
    filteredActivities,
  };
};
