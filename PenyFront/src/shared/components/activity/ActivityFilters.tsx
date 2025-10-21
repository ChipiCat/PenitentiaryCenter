import React from 'react';
import { Card, Group, ThemeIcon, Text, Badge, Grid, TextInput, Select } from '@mantine/core';
import { Search, Filter } from 'lucide-react';

export interface ActivityFilter {
  value: string;
  label: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface ActivityFiltersProps {
  title: string;
  icon: React.JSX.Element;
  iconColor: string;
  entityInfo?: string;
  totalCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string | null;
  onFilterChange: (value: string | null) => void;
  filterOptions: ActivityFilter[];
  searchPlaceholder?: string;
  filterPlaceholder?: string;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  title,
  icon,
  iconColor,
  entityInfo,
  totalCount,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  filterOptions,
  searchPlaceholder = "Buscar actividades...",
  filterPlaceholder = "Filtrar por tipo"
}) => {
  return (
    <Card withBorder padding="lg">
      <Group justify="space-between" mb="md">
        <Group>
          <ThemeIcon size="sm" variant="light" color={iconColor}>
            {icon}
          </ThemeIcon>
          <Text fw={500}>
            {title}
            {entityInfo && (
              <Text component="span" size="sm" c="dimmed" ml="xs">
                {entityInfo}
              </Text>
            )}
          </Text>
        </Group>
        <Badge variant="light">{totalCount} registros</Badge>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            placeholder={searchPlaceholder}
            leftSection={<Search size={16} />}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Select
            placeholder={filterPlaceholder}
            leftSection={<Filter size={16} />}
            clearable
            data={filterOptions}
            value={filterType}
            onChange={onFilterChange}
          />
        </Grid.Col>
      </Grid>
    </Card>
  );
};