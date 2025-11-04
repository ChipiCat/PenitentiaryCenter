import React, { useState } from 'react';
import { Card, Group, Select, TextInput, Button, Collapse, Badge } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { PrisonerSearchFilters } from '../../../../shared/types/prisonerSearchTypes';

interface PrisonersFiltersProps {
  filters: PrisonerSearchFilters;
  onFiltersChange: (filters: PrisonerSearchFilters) => void;
  onClearFilters: () => void;
}

export const PrisonersFilters: React.FC<PrisonersFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [opened, setOpened] = useState(false);

  const handleFilterChange = (key: keyof PrisonerSearchFilters, value: string | null) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleDateChange = (key: keyof PrisonerSearchFilters, value: Date | string | null) => {
    if (value instanceof Date) {
      onFiltersChange({
        ...filters,
        [key]: value.toISOString().split('T')[0],
      });
    } else if (typeof value === 'string') {
      onFiltersChange({
        ...filters,
        [key]: value,
      });
    } else {
      onFiltersChange({
        ...filters,
        [key]: undefined,
      });
    }
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== ''
  ).length;

  return (
    <Card withBorder p="md">
      <div>
        <Group justify="space-between" mb={opened ? 'md' : 0}>
          <Group gap="sm">
            <Button
              variant="subtle"
              leftSection={<Filter size={16} />}
              rightSection={opened ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              onClick={() => setOpened(!opened)}
              size="sm"
            >
              Filtros
            </Button>
            {activeFiltersCount > 0 && (
              <Badge color="blue" variant="filled" size="sm">
                {activeFiltersCount}
              </Badge>
            )}
          </Group>
          {activeFiltersCount > 0 && (
            <Button
              variant="subtle"
              color="red"
              size="sm"
              leftSection={<X size={16} />}
              onClick={onClearFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </Group>

        <Collapse in={opened}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Estado del Prisionero */}
            <Select
              label="Estado"
              placeholder="Seleccionar estado"
              value={filters.status || null}
              onChange={(value) => handleFilterChange('status', value)}
              data={[
                { value: 'Activo', label: 'Activo' },
                { value: 'Trasladado', label: 'Trasladado' },
                { value: 'Liberado', label: 'Liberado' },
                { value: 'Archivado', label: 'Archivado' },
              ]}
              clearable
              size="sm"
            />

            {/* Género */}
            <Select
              label="Género"
              placeholder="Seleccionar género"
              value={filters.gender || null}
              onChange={(value) => handleFilterChange('gender', value)}
              data={[
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Femenino', label: 'Femenino' },
                { value: 'Otro', label: 'Otro' },
              ]}
              clearable
              size="sm"
            />

            {/* Estado Civil */}
            <Select
              label="Estado Civil"
              placeholder="Seleccionar estado civil"
              value={filters.maritalStatus || null}
              onChange={(value) => handleFilterChange('maritalStatus', value)}
              data={[
                { value: 'Soltero', label: 'Soltero' },
                { value: 'Casado', label: 'Casado' },
                { value: 'Viudo', label: 'Viudo' },
                { value: 'Divorciado', label: 'Divorciado' },
              ]}
              clearable
              size="sm"
            />

            {/* Categoría Penitenciaria */}
            <Select
              label="Categoría"
              placeholder="Seleccionar categoría"
              value={filters.category || null}
              onChange={(value) => handleFilterChange('category', value)}
              data={[
                { value: 'DerechoComun', label: 'Derecho Común' },
                { value: 'PrisionPreventiva', label: 'Prisión Preventiva' },
                { value: 'PrisioneroAcusado', label: 'Prisionero Acusado' },
              ]}
              clearable
              size="sm"
            />

            {/* Tipo de Ciudadanía */}
            <Select
              label="Tipo de Ciudadanía"
              placeholder="Seleccionar tipo"
              value={filters.citizenshipType || null}
              onChange={(value) => handleFilterChange('citizenshipType', value)}
              data={[
                { value: 'Local', label: 'Local' },
                { value: 'CiudadanoNacional', label: 'Ciudadano Nacional' },
                { value: 'CiudadanoExtranjero', label: 'Ciudadano Extranjero' },
              ]}
              clearable
              size="sm"
            />

            {/* Número de Edificio */}
            <TextInput
              label="Edificio"
              placeholder="Ej: A, B, C"
              value={filters.buildingNumber || ''}
              onChange={(event) =>
                handleFilterChange('buildingNumber', event.currentTarget.value)
              }
              size="sm"
            />

            {/* Número de Celda */}
            <TextInput
              label="Celda"
              placeholder="Ej: 101, 202"
              value={filters.cellNumber || ''}
              onChange={(event) =>
                handleFilterChange('cellNumber', event.currentTarget.value)
              }
              size="sm"
            />

            {/* País de Origen */}
            <TextInput
              label="País de Origen"
              placeholder="Ej: México, España"
              value={filters.countryOfOrigin || ''}
              onChange={(event) =>
                handleFilterChange('countryOfOrigin', event.currentTarget.value)
              }
              size="sm"
            />

            {/* Nacionalidad */}
            <TextInput
              label="Nacionalidad"
              placeholder="Ej: Mexicana, Española"
              value={filters.nationality || ''}
              onChange={(event) =>
                handleFilterChange('nationality', event.currentTarget.value)
              }
              size="sm"
            />

            {/* Fecha de Admisión Desde */}
            <DateInput
              label="Admisión Desde"
              placeholder="Seleccionar fecha"
              value={filters.admissionDateFrom ? new Date(filters.admissionDateFrom) : null}
              onChange={(value) => handleDateChange('admissionDateFrom', value)}
              clearable
              size="sm"
              valueFormat="DD/MM/YYYY"
            />

            {/* Fecha de Admisión Hasta */}
            <DateInput
              label="Admisión Hasta"
              placeholder="Seleccionar fecha"
              value={filters.admissionDateTo ? new Date(filters.admissionDateTo) : null}
              onChange={(value) => handleDateChange('admissionDateTo', value)}
              clearable
              size="sm"
              valueFormat="DD/MM/YYYY"
            />
          </div>
        </Collapse>
      </div>
    </Card>
  );
};
