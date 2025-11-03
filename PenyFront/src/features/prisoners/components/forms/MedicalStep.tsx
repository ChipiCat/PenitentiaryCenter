import React, { useCallback, useMemo } from "react";
import { Stack, Title, Card } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { MedicalRecord } from "../../../../shared/types";
import { TextInputField } from "../../../../shared/components/TextInputField";
import { TextareaField } from "../../../../shared/components/TextareaField";
import { BelongingDropzone } from "../../../../shared/components/BelongingDropzone";
import { toDateObject } from "./utils/dateUtils";

interface MedicalStepProps {
  data: { medical_record?: Partial<MedicalRecord>[] };
  onUpdate: (updates: { medical_record?: Partial<MedicalRecord>[] }) => void;
  onFileUpdate?: (fileType: 'medicalFile', file: File | undefined) => void;
  errors?: Record<string, string>;
}

export const MedicalStep: React.FC<MedicalStepProps> = React.memo(
  ({ data, onUpdate, onFileUpdate, errors = {} }) => {
    // Memoizar datos para evitar re-crear objetos
    const medicalRecords = useMemo(
      () => data.medical_record || [],
      [data.medical_record]
    );
    const medical = useMemo(() => medicalRecords[0] || {}, [medicalRecords]);

    const handleMedicalChange = useCallback(
      (field: keyof MedicalRecord, value: string | Date | undefined) => {
        onUpdate({
          medical_record: [
            {
              ...medical,
              [field]: value,
            },
          ],
        });
      },
      [onUpdate, medical]
    );

    return (
      <Stack gap="lg">
        <Card withBorder padding="lg">
          <Title order={4} size="h5" mb="md">
            Examen Médico
          </Title>
          <Stack gap="md">
            <TextInputField
              label="Nombre del Doctor"
              placeholder="Ej: Dr. Juan Pérez"
              value={medical.doctor_name || ""}
              onChange={(e) =>
                handleMedicalChange("doctor_name", e.target.value)
              }
              error={errors["medical_record.0.doctor_name"]}
              required
              debounce={true}
            />
            <DatePickerInput
              label="Fecha de Examen"
              placeholder="Selecciona la fecha"
              value={toDateObject(medical.examination_date)}
              onChange={(date) =>
                handleMedicalChange("examination_date", date ?? undefined)
              }
              error={errors["medical_record.0.examination_date"]}
              required
              maxDate={new Date()}
            />
            <TextInputField
              label="Ubicación o Número de Referencia para el archivo médico"
              placeholder="Ej: REF-12345"
              value={medical.reference_number || ""}
              onChange={(e) =>
                handleMedicalChange("reference_number", e.target.value)
              }
              error={errors["medical_record.0.reference_number"]}
              debounce={true}
            />
            <TextareaField
              label="Notas"
              placeholder="Observaciones del examen médico"
              value={medical.notes || ""}
              onChange={(e) => handleMedicalChange("notes", e.target.value)}
              error={errors["medical_record.0.notes"]}
              minRows={3}
              debounce={true}
            />
            <BelongingDropzone
              onFile={(file) => {
                onFileUpdate?.('medicalFile', file);
              }}
            />
          </Stack>
        </Card>
      </Stack>
    );
  }
);

MedicalStep.displayName = "MedicalStep";
