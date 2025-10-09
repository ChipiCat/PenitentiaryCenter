import { 
  Paper, 
  Title, 
  Stack, 
  Text, 
  Select, 
  Group, 
  NumberInput, 
  TextInput, 
  Divider, 
  Button 
} from '@mantine/core';
import { Calendar, Download } from 'lucide-react';
import type { ReportFilters } from '../types/reportTypes';
import { crimeTypeOptions, processStatusOptions, genderOptions } from '../constants/reportConstants';

interface FiltersSectionProps {
  filters: ReportFilters;
  onFiltersChange: {
    setCrimeType: (value: string | null) => void;
    setProcessStatus: (value: string | null) => void;
    setGender: (value: string | null) => void;
    setMinAge: (value: number | string) => void;
    setMaxAge: (value: number | string) => void;
    setStartDate: (value: string) => void;
    setEndDate: (value: string) => void;
  };
  onClearFilters: () => void;
  onExportToExcel: () => void;
}

export const FiltersSection = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  onExportToExcel 
}: FiltersSectionProps) => {
  return (
    <Paper p="lg" radius="md" withBorder h="100%">
      <Title order={4} mb="md">Filtros Personalizados</Title>
      <Stack gap="md">
        {/* Tipo de Delito */}
        <div>
          <Text size="sm" fw={500} mb="xs">Tipo de Delito</Text>
          <Select
            placeholder="Todos los delitos"
            data={crimeTypeOptions}
            value={filters.crimeType}
            onChange={onFiltersChange.setCrimeType}
            clearable
          />
        </div>

        {/* Estado Procesal */}
        <div>
          <Text size="sm" fw={500} mb="xs">Estado Procesal</Text>
          <Select
            placeholder="Todos los estados"
            data={processStatusOptions}
            value={filters.processStatus}
            onChange={onFiltersChange.setProcessStatus}
            clearable
          />
        </div>

        {/* Sexo */}
        <div>
          <Text size="sm" fw={500} mb="xs">Sexo</Text>
          <Select
            placeholder="Todos"
            data={genderOptions}
            value={filters.gender}
            onChange={onFiltersChange.setGender}
            clearable
          />
        </div>

        {/* Rango de Edad */}
        <div>
          <Text size="sm" fw={500} mb="xs">Rango de Edad</Text>
          <Group grow>
            <NumberInput
              placeholder="Edad mínima"
              value={filters.minAge}
              onChange={onFiltersChange.setMinAge}
              min={18}
              max={100}
            />
            <NumberInput
              placeholder="Edad máxima"
              value={filters.maxAge}
              onChange={onFiltersChange.setMaxAge}
              min={18}
              max={100}
            />
          </Group>
        </div>

        {/* Período */}
        <div>
          <Text size="sm" fw={500} mb="xs">Período</Text>
          <Group grow>
            <TextInput
              type="date"
              placeholder="Fecha inicio"
              value={filters.startDate}
              onChange={(e) => onFiltersChange.setStartDate(e.currentTarget.value)}
              leftSection={<Calendar size={16} />}
            />
            <TextInput
              type="date"
              placeholder="Fecha fin"
              value={filters.endDate}
              onChange={(e) => onFiltersChange.setEndDate(e.currentTarget.value)}
              leftSection={<Calendar size={16} />}
            />
          </Group>
        </div>

        <Divider />

        {/* Botones de acción */}
        <Group justify="space-between">
          <Button
            variant="light"
            onClick={onClearFilters}
            size="sm"
          >
            Limpiar Filtros
          </Button>
          <Button
            leftSection={<Download size={16} />}
            onClick={onExportToExcel}
            size="sm"
          >
            Exportar a Excel
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};
