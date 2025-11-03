import React, { useState } from 'react';
import { Card, Stack, Group, Button, Select, Title } from '@mantine/core';
import { Building } from 'lucide-react';
import type { CompletePrisonerProfile } from '../../../../../shared/types';
import type { UpdatePenitentiaryData } from '../../../../../shared/types/penitentiaryTypes';
import { OptimizedTextInput } from '../../forms/OptimizedInput';

interface PenitentiaryEditFormProps {
  profile: CompletePrisonerProfile;
  onSave: (penitentiaryData: Partial<UpdatePenitentiaryData>) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
  errors?: {
    penitentiary?: Record<string, string>;
  };
}

export const PenitentiaryEditForm: React.FC<PenitentiaryEditFormProps> = ({
  profile,
  onSave,
  onCancel,
  isLoading,
  errors = {},
}) => {
  // ==================== ESTADO DEL FORMULARIO ====================
  const [penitentiaryData, setPenitentiaryData] = useState<Partial<UpdatePenitentiaryData>>({
    category: (profile.penitentiary?.category as "DerechoComun" | "PrisionPreventiva" | "PrisioneroAcusado") ?? undefined,
    building_number: profile.penitentiary?.building_number ?? '',
    cell_number: profile.penitentiary?.cell_number ?? '',
    bed_number: profile.penitentiary?.bed_number ?? '',
  });

  // ==================== MANEJADORES ====================
  const handleChange = (field: keyof UpdatePenitentiaryData, value: string | undefined) => {
    setPenitentiaryData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSave(penitentiaryData);
  };

  // ==================== RENDERIZADO ====================
  return (
    <Stack gap="md">
      <Card withBorder padding="lg" className="relative">
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <Building size={20} />
            <Title order={4} size="h5">
              Editar Ubicación Penitenciaria
            </Title>
          </Group>
        </Group>

        <Stack gap="md">
          {/* Categoría de Prisionero */}
          <Select
            label="Categoría de Prisionero"
            placeholder="Seleccione la categoría"
            value={penitentiaryData.category}
            onChange={(value) => handleChange('category', value as "DerechoComun" | "PrisionPreventiva" | "PrisioneroAcusado" | undefined)}
            data={[
              { value: 'DerechoComun', label: 'Derecho Común' },
              { value: 'PrisionPreventiva', label: 'Prisión Preventiva' },
              { value: 'PrisioneroAcusado', label: 'Prisionero Acusado' },
            ]}
            error={errors.penitentiary?.category}
            clearable
          />

          {/* Ubicación Física */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <OptimizedTextInput
              label="Edificio"
              placeholder="Ej: Edificio A"
              value={penitentiaryData.building_number ?? ''}
              onChange={(value: string) => handleChange('building_number', value || undefined)}
              error={errors.penitentiary?.building_number}
            />

            <OptimizedTextInput
              label="Celda"
              placeholder="Ej: Celda 101"
              value={penitentiaryData.cell_number ?? ''}
              onChange={(value: string) => handleChange('cell_number', value || undefined)}
              error={errors.penitentiary?.cell_number}
            />

            <OptimizedTextInput
              label="Cama"
              placeholder="Ej: Cama 1"
              value={penitentiaryData.bed_number ?? ''}
              onChange={(value: string) => handleChange('bed_number', value || undefined)}
              error={errors.penitentiary?.bed_number}
            />
          </div>

          {/* Botones de Acción */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isLoading}
            >
              Guardar Cambios
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};
