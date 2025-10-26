import React, { useCallback, useMemo } from "react";
import { Stack, Title, Card, Text } from "@mantine/core";
import type { Penitentiary } from "../../../../shared/types";
import { prisonCategoryOptions } from "../../../../shared/types/users/userEnumTypes";
import { InputGroup } from "../../../../shared/components/InputGroup";
import { SelectField } from "../../../../shared/components/SelectField";
import { TextInputField } from "../../../../shared/components/TextInputField";

interface PenitentiaryInfoStepProps {
  data: { penitentiary?: Partial<Penitentiary> };
  onUpdate: (updates: { penitentiary?: Partial<Penitentiary> }) => void;
  errors?: Record<string, string>;
}

export const PenitentiaryInfoStep: React.FC<PenitentiaryInfoStepProps> = React.memo(({
  data,
  onUpdate,
  errors = {},
}) => {
  // Memoizar datos para evitar re-crear objetos
  const penitentiary = useMemo(() => data.penitentiary || {}, [data.penitentiary]);

  const handlePenitentiaryChange = useCallback((
    field: keyof Penitentiary,
    value: string | number | undefined
  ) => {
    onUpdate({
      penitentiary: {
        ...penitentiary,
        [field]: value,
      },
    });
  }, [onUpdate, penitentiary]);

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md">
          Ubicación Penitenciaria
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Información sobre la ubicación y categoría del prisionero dentro del
          centro
        </Text>
        <Stack gap="md">
          <InputGroup>
            <SelectField
              label="Categoría de Prisionero"
              placeholder="Seleccione la categoría"
              value={penitentiary.category || ""}
              onChange={(value) =>
                handlePenitentiaryChange("category", value || undefined)
              }
              data={prisonCategoryOptions}
              required
              error={errors["penitentiary.category"]}
              description="Clasificación según el estatus legal del prisionero"
            />
          </InputGroup>
          <InputGroup>
            <TextInputField
              label="Número de Edificio"
              placeholder="Ej: A, B, C o 1, 2, 3"
              value={penitentiary.building_number || ""}
              onChange={(e) =>
                handlePenitentiaryChange("building_number", e.target.value)
              }
              error={errors["penitentiary.building_number"]}
              required
              debounce={true}
            />
            <TextInputField
              label="Número de Celda"
              placeholder="Ej: 101, 102, etc."
              value={penitentiary.cell_number || ""}
              onChange={(e) =>
                handlePenitentiaryChange("cell_number", e.target.value)
              }
              error={errors["penitentiary.cell_number"]}
              required
              debounce={true}
            />
          </InputGroup>
          <InputGroup>
            <TextInputField
              label="Número de Cama"
              placeholder="Ej: 1, 2, 3"
              value={penitentiary.bed_number || ""}
              onChange={(e) =>
                handlePenitentiaryChange("bed_number", e.target.value)
              }
              error={errors["penitentiary.bed_number"]}
              description="Número de cama dentro de la celda"
              required
              debounce={true}
            />
          </InputGroup>
        </Stack>
      </Card>
    </Stack>
  );
});

PenitentiaryInfoStep.displayName = 'PenitentiaryInfoStep';
