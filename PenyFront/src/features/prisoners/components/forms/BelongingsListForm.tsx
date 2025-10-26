import {
  Card,
  Stack,
  Title,
  Group,
  Button,
  ActionIcon,
  Text,
} from "@mantine/core";
import { Plus, Trash2 } from "lucide-react";
import { InputGroup } from "../../../../shared/components/InputGroup";
import { TextInputField } from "../../../../shared/components/TextInputField";
import { SelectField } from "../../../../shared/components/SelectField";
import { BelongingDropzone } from "../../../../shared/components/BelongingDropzone";
import { booleanOptions } from "../../../../shared/types/users/userEnumTypes";
import type { Belonging } from "../../../../shared/types";

interface BelongingsListFormProps {
  items: Partial<Belonging>[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof Belonging,
    value: string | number | boolean | undefined
  ) => void;
  errors?: Record<string, string>;
  addLabel?: string;
}

export function BelongingsListForm({
  items,
  onAdd,
  onRemove,
  onChange,
  errors = {},
  addLabel = "Agregar pertenencia",
}: BelongingsListFormProps) {
  return (
    <Card withBorder padding="lg">
      <Title order={4} size="h5" mb="md">
        Pertenencias
      </Title>
      <Stack gap="md">
        {items.map((belonging, index) => (
          <Card key={index} withBorder padding="md">
            <Group justify="space-between" mb="sm">
              <Text size="sm" fw={500}>
                Pertenencia {index + 1}
              </Text>
              <ActionIcon
                color="red"
                variant="light"
                size="sm"
                onClick={() => onRemove(index)}
              >
                <Trash2 size={14} />
              </ActionIcon>
            </Group>
            <Stack gap="sm">
              <InputGroup>
                <TextInputField
                  label="Descripción"
                  value={belonging.description}
                  onChange={(e) =>
                    onChange(index, "description", e.target.value)
                  }
                  error={errors[`belonging.${index}.description`]}
                  required
                  placeholder="Ej: Reloj de pulsera"
                />
                <TextInputField
                  label="Cantidad de Objetos"
                  value={String(belonging.quantity)}
                  onChange={(e) =>
                    onChange(index, "quantity", Number(e.target.value))
                  }
                  error={errors[`belonging.${index}.quantity`]}
                  required
                  placeholder="Ej: 1"
                  type="number"
                  min={1}
                />
              </InputGroup>
              <InputGroup>
                <TextInputField
                  label="Condición"
                  value={belonging.condition}
                  onChange={(e) => onChange(index, "condition", e.target.value)}
                  error={errors[`belonging.${index}.condition`]}
                  required
                  placeholder="Ej: Buen estado"
                />
                <SelectField
                  label="¿Devuelto?"
                  value={belonging.is_returned ? "Sí" : "No"}
                  onChange={(value) =>
                    onChange(index, "is_returned", value === "Sí")
                  }
                  data={booleanOptions}
                  error={errors[`belonging.${index}.is_returned`]}
                  required
                  placeholder="Seleccione"
                />
              </InputGroup>
              <InputGroup>
                <BelongingDropzone
                  onFile={(file) => {
                    const url = file ? URL.createObjectURL(file) : "";
                    onChange(index, "attachment_url", url);
                  }}
                />
              </InputGroup>
            </Stack>
          </Card>
        ))}
        <Button
          leftSection={<Plus size={16} />}
          onClick={onAdd}
          variant="light"
        >
          {addLabel}
        </Button>
      </Stack>
    </Card>
  );
}
