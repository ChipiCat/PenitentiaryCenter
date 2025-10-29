import React from "react";
import { TextInput, Group, Stack, Title, Card, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { CreateCaseData } from "../../../../shared/types/caseTypes";
import { BelongingDropzone } from "../../../../shared/components/BelongingDropzone";

type InitialCase = CreateCaseData;

interface LegalCaseStepProps {
  data: { initialCase?: InitialCase };
  onUpdate: (updates: { initialCase?: InitialCase }) => void;
  errors?: Record<string, string>;
}

export const LegalCaseStep: React.FC<LegalCaseStepProps> = ({
  data,
  onUpdate,
  errors = {},
}) => {
  const handleInitialCaseChange = (
    field: keyof InitialCase,
    value: string | Date | undefined
  ) => {
    let newValue = value;
    if (typeof value === "undefined") newValue = "";
    if (value instanceof Date) newValue = value.toISOString().slice(0, 10);
    const current = (data.initialCase || {}) as Partial<InitialCase>;
    const fullCase: InitialCase = {
      case_number: current.case_number ?? "",
      case_type: current.case_type ?? "",
      court: current.court ?? "",
      judge: current.judge ?? "",
      status: current.status ?? "",
      start_date: current.start_date ?? "",
      end_date: current.end_date ?? "",
      description: current.description ?? "",
      attachment_url: current.attachment_url ?? "",
      [field]: newValue,
    };
    onUpdate({ initialCase: fullCase });
  };

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md">
          Caso Judicial Principal
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Información del caso judicial principal que motivó el ingreso al
          centro penitenciario
        </Text>

        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Número de Caso"
              placeholder="Ej: CASO-2024-001"
              value={data.initialCase?.case_number || ""}
              onChange={(e) =>
                handleInitialCaseChange("case_number", e.target.value)
              }
              required
              error={errors["initialCase.case_number"]}
              description="Número único del expediente judicial"
            />
            <DatePickerInput
              label="Fecha de Inicio"
              placeholder="Fecha del caso"
              value={data.initialCase?.start_date || null}
              onChange={(date) =>
                handleInitialCaseChange("start_date", date ?? undefined)
              }
              error={errors["initialCase.start_date"]}
              maxDate={new Date()}
            />
          </Group>

          <TextInput
            label="Delito/Causa Penal"
            placeholder="Descripción del delito o causa"
            value={data.initialCase?.case_type || ""}
            onChange={(e) => handleInitialCaseChange("case_type", e.target.value)}
            required
            error={errors["initialCase.case_type"]}
            description="Descripción del delito por el cual fue procesado"
          />

          <Group grow>
            <TextInput
              label="Nombre del Juzgado/Tribunal"
              placeholder="Ej: Tribunal de Sentencia Penal"
              value={data.initialCase?.court || ""}
              onChange={(e) =>
                handleInitialCaseChange("court", e.target.value)
              }
              error={errors["initialCase.court"]}
              required
            />
            <TextInput
              label="Nombre del Juez"
              placeholder="Nombre del juez a cargo"
              value={data.initialCase?.judge || ""}
              onChange={(e) =>
                handleInitialCaseChange("judge", e.target.value)
              }
              error={errors["initialCase.judge"]}
              required
            />
          </Group>
          <BelongingDropzone
            onFile={(file) => {
              const url = file ? URL.createObjectURL(file) : "";
              const current = (data.initialCase || {}) as Partial<InitialCase>;
              const fullCase: InitialCase = {
                case_number: current.case_number ?? "",
                case_type: current.case_type ?? "",
                court: current.court ?? "",
                judge: current.judge ?? "",
                status: current.status ?? "",
                start_date: current.start_date ?? "",
                end_date: current.end_date ?? "",
                description: current.description ?? "",
                attachment_url: url,
              };
              onUpdate({ initialCase: fullCase });
            }}
          />
        </Stack>
      </Card>
    </Stack>
  );
};
