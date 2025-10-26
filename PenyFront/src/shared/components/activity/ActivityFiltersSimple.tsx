import React from "react";
import { Group, Select, TextInput } from "@mantine/core";
import { Search } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface ActivityFiltersSimpleProps {
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  actionOptions: FilterOption[];
  timeOptions: FilterOption[];
  showSearch?: boolean;
  searchPlaceholder?: string;
}

export const ActivityFiltersSimple: React.FC<ActivityFiltersSimpleProps> = ({
  actionFilter,
  onActionFilterChange,
  timeFilter,
  onTimeFilterChange,
  searchTerm,
  onSearchChange,
  actionOptions,
  timeOptions,
  showSearch = false,
  searchPlaceholder = "Buscar actividades...",
}) => {
  return (
    <Group gap="xs">
      {showSearch && onSearchChange && (
        <TextInput
          placeholder={searchPlaceholder}
          leftSection={<Search size={16} />}
          value={searchTerm || ""}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          style={{ minWidth: 200 }}
        />
      )}

      <Select
        placeholder="Filtrar acciones"
        value={actionFilter}
        onChange={(value) => onActionFilterChange(value || "all")}
        data={actionOptions}
        style={{ minWidth: 180 }}
      />

      <Select
        placeholder="Periodo"
        value={timeFilter}
        onChange={(value) => onTimeFilterChange(value || "today")}
        data={timeOptions}
        style={{ minWidth: 120 }}
      />
    </Group>
  );
};
