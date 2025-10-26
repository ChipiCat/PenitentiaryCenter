import React from "react";
import {
  TextInput,
  Select,
  Group,
  Stack,
  Title,
  Card,
  Text,
} from "@mantine/core";
import type { Penitentiary } from "../../../../shared/types";

interface PenitentiaryInfoStepProps {
  data: { penitentiary?: Partial<Penitentiary> };
  onUpdate: (updates: { penitentiary?: Partial<Penitentiary> }) => void;
  errors?: Record<string, string>;
}

export const PenitentiaryInfoStep: React.FC<PenitentiaryInfoStepProps> = ({
  data,
  onUpdate,
  errors = {},
}) => {
  const handlePenitentiaryChange = (
    field: keyof Penitentiary,
    value: string | number | undefined
  ) => {
    onUpdate({
      penitentiary: {
        ...data.penitentiary,
        [field]: value,
      },
    });
  };

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
          <Select
            label="Categoría de Prisionero"
            placeholder="Seleccione la categoría"
            value={data.penitentiary?.category || ""}
            onChange={(value) => handlePenitentiaryChange("category", value || undefined)}
            data={[
              { value: "Derecho Común", label: "Derecho Común" },
              { value: "Prisión Preventiva", label: "Prisión Preventiva" },
              { value: "Prisionero Acusado", label: "Prisionero Acusado" },
            ]}
            required
            error={errors["penitentiary.category"]}
            description="Clasificación según el estatus legal del prisionero"
          />

          <Group grow>
            <TextInput
              label="Número de Edificio"
              placeholder="Ej: A, B, C o 1, 2, 3"
              value={data.penitentiary?.building_number || ""}
              onChange={(e) =>
                handlePenitentiaryChange("building_number", e.target.value)
              }
              error={errors["penitentiary.building_number"]}
            />
            <TextInput
              label="Número de Celda"
              placeholder="Ej: 101, 102, etc."
              value={data.penitentiary?.cell_number || ""}
              onChange={(e) =>
                handlePenitentiaryChange("cell_number", e.target.value)
              }
              error={errors["penitentiary.cell_number"]}
            />
          </Group>

          <TextInput
            label="Número de Cama"
            placeholder="Ej: 1, 2, 3 (si aplica)"
            value={data.penitentiary?.bed_number || ""}
            onChange={(e) =>
              handlePenitentiaryChange("bed_number", e.target.value)
            }
            error={errors["penitentiary.bed_number"]}
            description="Número de cama dentro de la celda (opcional)"
          />
        </Stack>
      </Card>
    </Stack>
  );
};
