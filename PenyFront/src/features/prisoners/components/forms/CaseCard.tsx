import React, { useCallback } from "react";
import { Card, Stack, Title, Group, ActionIcon, Button, Text, Divider } from "@mantine/core";
import { Trash2, Plus } from "lucide-react";
import { DatePickerInput } from "@mantine/dates";
import { TextInputField } from "../../../../shared/components/TextInputField";
import { SelectField } from "../../../../shared/components/SelectField";
import { TextareaField } from "../../../../shared/components/TextareaField";
import { MandateCard } from "./MandateCard";
import type { CaseFormData, MandateFormData } from "../../../../shared/types/forms/legalCaseFormTypes";

interface CaseCardProps {
  caseData: CaseFormData;
  index: number;
  onChange: (caseIndex: number, field: keyof CaseFormData, value: string | number | null | Date) => void;
  onMandateChange: (caseIndex: number, mandateIndex: number, field: keyof MandateFormData, value: string | number | null | Date | File) => void;
  onRemove: (index: number) => void;
  onAddMandate: (caseIndex: number) => void;
  onRemoveMandate: (caseIndex: number, mandateIndex: number) => void;
  errors?: Record<string, string>;
}

const caseStatusOptions = [
  { value: 'EnProceso', label: 'En Proceso' },
  { value: 'Condenado', label: 'Condenado' },
  { value: 'Apelacion', label: 'Apelación' },
  { value: 'Cerrado', label: 'Cerrado' },
];

export const CaseCard: React.FC<CaseCardProps> = React.memo(({
  caseData,
  index,
  onChange,
  onMandateChange,
  onRemove,
  onAddMandate,
  onRemoveMandate,
  errors = {},
}) => {
  const errorPrefix = `cases.${index}`;

  const handleStartDateChange = useCallback((value: Date | string | null) => {
    const dateValue = value;
    if (dateValue instanceof Date) {
      onChange(index, 'start_date', dateValue.toISOString().split('T')[0]);
    } else if (typeof dateValue === 'string') {
      onChange(index, 'start_date', dateValue);
    } else {
      onChange(index, 'start_date', '');
    }
  }, [index, onChange]);

  const handleEndDateChange = useCallback((value: Date | string | null) => {
    const dateValue = value;
    if (dateValue instanceof Date) {
      onChange(index, 'end_date', dateValue.toISOString().split('T')[0]);
    } else if (typeof dateValue === 'string') {
      onChange(index, 'end_date', dateValue);
    } else {
      onChange(index, 'end_date', '');
    }
  }, [index, onChange]);

  return (
    <Card withBorder padding="lg" shadow="sm">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={5}>Caso #{index + 1}</Title>
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => onRemove(index)}
            aria-label="Eliminar caso"
          >
            <Trash2 size={18} />
          </ActionIcon>
        </Group>

        <Group grow>
          <TextInputField
            label="Número de Caso"
            placeholder="Ej: CASO-2024-001"
            value={caseData.case_number || ''}
            onChange={(e) => onChange(index, 'case_number', e.target.value)}
            required
            error={errors[`${errorPrefix}.case_number`]}
            debounce
          />
          <SelectField
            label="Estado del Caso"
            placeholder="Seleccione el estado"
            value={caseData.status || ''}
            onChange={(value) => onChange(index, 'status', value)}
            data={caseStatusOptions}
            error={errors[`${errorPrefix}.status`]}
            required
          />
        </Group>

        <TextInputField
          label="Delito/Crimen"
          placeholder="Descripción del delito"
          value={caseData.crime || ''}
          onChange={(e) => onChange(index, 'crime', e.target.value)}
          required
          error={errors[`${errorPrefix}.crime`]}
          debounce
        />

        <Group grow>
          <DatePickerInput
            label="Fecha de Inicio"
            placeholder="Fecha del caso"
            value={caseData.start_date ? new Date(caseData.start_date) : null}
            onChange={handleStartDateChange}
            error={errors[`${errorPrefix}.start_date`]}
            maxDate={new Date()}
            required
          />
          <DatePickerInput
            label="Fecha de Fin"
            placeholder="Fecha estimada de fin"
            value={caseData.end_date ? new Date(caseData.end_date) : null}
            onChange={handleEndDateChange}
            error={errors[`${errorPrefix}.end_date`]}
          />
        </Group>

        <Group grow>
          <TextInputField
            label="Nombre del Juzgado/Tribunal"
            placeholder="Ej: Tribunal de Sentencia Penal"
            value={caseData.court_name || ''}
            onChange={(e) => onChange(index, 'court_name', e.target.value)}
            error={errors[`${errorPrefix}.court_name`]}
            required
            debounce
          />
          <TextInputField
            label="Nombre del Juez"
            placeholder="Nombre del juez a cargo"
            value={caseData.judge_name || ''}
            onChange={(e) => onChange(index, 'judge_name', e.target.value)}
            error={errors[`${errorPrefix}.judge_name`]}
            required
            debounce
          />
        </Group>

        <TextInputField
          label="Años de Sentencia"
          placeholder="Número de años"
          type="number"
          value={caseData.sentence_years?.toString() || ''}
          onChange={(e) => onChange(index, 'sentence_years', parseInt(e.target.value) || 0)}
          error={errors[`${errorPrefix}.sentence_years`]}
          required
          debounce
        />

        <TextareaField
          label="Observaciones"
          placeholder="Información adicional del caso"
          value={caseData.remarks || ''}
          onChange={(e) => onChange(index, 'remarks', e.target.value)}
          error={errors[`${errorPrefix}.remarks`]}
          minRows={2}
          debounce
        />

        <Divider my="sm" />
        
        <Group justify="space-between">
          <Text size="sm" fw={600}>
            Mandatos Judiciales
          </Text>
          <Button
            leftSection={<Plus size={16} />}
            variant="light"
            size="xs"
            onClick={() => onAddMandate(index)}
          >
            Agregar Mandato
          </Button>
        </Group>

        {caseData.mandates.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No hay mandatos registrados. Agrega uno para comenzar.
          </Text>
        ) : (
          <Stack gap="sm">
            {caseData.mandates.map((mandate, mandateIndex) => (
              <MandateCard
                key={mandate.tempId || mandateIndex}
                mandate={mandate}
                index={mandateIndex}
                caseIndex={index}
                onChange={onMandateChange}
                onRemove={onRemoveMandate}
                errors={errors}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
});

CaseCard.displayName = 'CaseCard';
