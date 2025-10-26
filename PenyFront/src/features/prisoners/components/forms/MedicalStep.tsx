import React from "react";
import { Stack, TextInput, Textarea, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { MedicalRecord } from "../../../../shared/types";
import { BelongingDropzone } from "../../../../shared/components/BelongingDropzone";

interface MedicalStepProps {
  data: { medical_record?: Partial<MedicalRecord>[] };
  onUpdate: (updates: { medical_record?: Partial<MedicalRecord>[] }) => void;
  errors?: Record<string, string>;
}

export const MedicalStep: React.FC<MedicalStepProps> = ({ data, onUpdate, errors = {} }) => {
  const medical = data.medical_record?.[0] || {};

  return (
    <Stack gap="md">
      <Title order={5} mb="sm">Examen Médico</Title>
      <TextInput
        label="Nombre del Doctor"
        placeholder="Ej: Dr. Juan Perez"
        value={medical.doctor_name || ""}
        onChange={e => onUpdate({ medical_record: [{ ...medical, doctor_name: e.target.value }] })}
        error={errors["medical.doctor_name"]}
        required
      />
      <DatePickerInput
        label="Fecha de Examen"
        placeholder="Selecciona la fecha"
        value={medical.examination_date ? new Date(medical.examination_date) : null}
        onChange={date => onUpdate({ medical_record: [{ ...medical, examination_date: date ?? undefined }] })}
        error={errors["medical.examination_date"]}
        required
      />
      <TextInput
        label="Número de Referencia"
        placeholder="Ej: REF-12345"
        value={medical.reference_number || ""}
        onChange={e => onUpdate({ medical_record: [{ ...medical, reference_number: e.target.value }] })}
        error={errors["medical.reference_number"]}
        required
      />
      <Textarea
        label="Notas"
        placeholder="Observaciones del examen"
        value={medical.notes || ""}
        onChange={e => onUpdate({ medical_record: [{ ...medical, notes: e.target.value }] })}
        error={errors["medical.notes"]}
        minRows={2}
      />
      <BelongingDropzone
        onFile={(file) => {
          const url = file ? URL.createObjectURL(file) : "";
          onUpdate({ medical_record: [{ ...medical, attachment_url: url }] });
        }}
      />
    </Stack>
  );
};
