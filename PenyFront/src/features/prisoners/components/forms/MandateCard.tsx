import React, { useCallback } from "react";
import { Card, Group, Stack, Text, ActionIcon, Badge } from "@mantine/core";
import { Trash2 } from "lucide-react";
import { DatePickerInput } from "@mantine/dates";
import { SelectField } from "../../../../shared/components/SelectField";
import { TextareaField } from "../../../../shared/components/TextareaField";
import { BelongingDropzone } from "../../../../shared/components/BelongingDropzone";
import type { MandateFormData } from "../../../../shared/types/forms/legalCaseFormTypes";
import { toDateObject, formatDateToISO } from "./utils/dateUtils";

interface MandateCardProps {
  mandate: MandateFormData;
  index: number;
  caseIndex: number;
  onChange: (caseIndex: number, mandateIndex: number, field: keyof MandateFormData, value: string | number | null | Date | File) => void;
  onRemove: (caseIndex: number, mandateIndex: number) => void;
  errors?: Record<string, string>;
}

const mandateTypeOptions = [
  { value: 'Detencion', label: 'Detención' },
  { value: 'Condena', label: 'Condena' },
  { value: 'Libertad', label: 'Libertad' },
  { value: 'Apelacion', label: 'Apelación' },
  { value: 'Traslado', label: 'Traslado' },
];

const mandateStatusOptions = [
  { value: 'Vigente', label: 'Vigente' },
  { value: 'Ejecutado', label: 'Ejecutado' },
  { value: 'Anulado', label: 'Anulado' },
];

export const MandateCard: React.FC<MandateCardProps> = React.memo(({
  mandate,
  index,
  caseIndex,
  onChange,
  onRemove,
  errors = {},
}) => {
  const errorPrefix = `cases.${caseIndex}.mandates.${index}`;

  const handleFileChange = useCallback((file: File) => {
    onChange(caseIndex, index, 'file', file);
  }, [caseIndex, index, onChange]);

  const handleIssueDateChange = useCallback((dateValue: Date | string | null) => {
    let dateString = '';
    if (dateValue instanceof Date) {
      dateString = formatDateToISO(dateValue) ?? '';
    } else if (typeof dateValue === 'string') {
      dateString = dateValue;
    }
    onChange(caseIndex, index, 'issue_date', dateString);
  }, [caseIndex, index, onChange]);

  return (
    <Card withBorder padding="md" bg="gray.0">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <Text size="sm" fw={600}>
              Mandato #{index + 1}
            </Text>
            {mandate.status && (
              <Badge size="sm" variant="light">
                {mandate.status}
              </Badge>
            )}
          </Group>
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => onRemove(caseIndex, index)}
            aria-label="Eliminar mandato"
          >
            <Trash2 size={16} />
          </ActionIcon>
        </Group>

        <Group grow>
          <SelectField
            label="Tipo de Mandato"
            placeholder="Seleccione el tipo"
            value={mandate.type || ''}
            onChange={(value) => onChange(caseIndex, index, 'type', value)}
            data={mandateTypeOptions}
            error={errors[`${errorPrefix}.type`]}
            required
          />
          <SelectField
            label="Estado"
            placeholder="Seleccione el estado"
            value={mandate.status || ''}
            onChange={(value) => onChange(caseIndex, index, 'status', value)}
            data={mandateStatusOptions}
            error={errors[`${errorPrefix}.status`]}
            required
          />
        </Group>

        <DatePickerInput
          label="Fecha de Emisión"
          placeholder="Fecha del mandato"
          value={toDateObject(mandate.issue_date)}
          onChange={handleIssueDateChange}
          error={errors[`${errorPrefix}.issue_date`]}
          maxDate={new Date()}
          required
        />

        <TextareaField
          label="Descripción"
          placeholder="Detalles del mandato"
          value={mandate.description || ''}
          onChange={(e) => onChange(caseIndex, index, 'description', e.target.value)}
          error={errors[`${errorPrefix}.description`]}
          minRows={2}
          debounce
        />

        <BelongingDropzone onFile={handleFileChange} />
      </Stack>
    </Card>
  );
});

MandateCard.displayName = 'MandateCard';
