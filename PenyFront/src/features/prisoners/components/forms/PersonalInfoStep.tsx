import React from "react";
import {
  TextInput,
  Select,
  Group,
  Stack,
  Textarea,
  Title,
  Card,
} from "@mantine/core";
import type {
  Personal,
  MaritalStatus,
  EducationLevel,
  Gender,
} from "../../../../shared/types";

interface PersonalInfoStepProps {
  data: { personal?: Partial<Personal> };
  onUpdate: (updates: { personal?: Partial<Personal> }) => void;
  errors?: Record<string, string>;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onUpdate,
  errors = {},
}) => {
  // Handler para datos personales
  const handlePersonalChange = (field: keyof Personal, value: any) => {
    onUpdate({
      personal: {
        ...data.personal,
        [field]: value,
      },
    });
  };

  return (
    <Stack gap="lg">
      {/* 👤 INFORMACIÓN PERSONAL */}
      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md" c="purple">
          👤 Información Personal
        </Title>

        <Stack gap="md">
          <Group grow>
            <Select
              label="Estado Civil"
              placeholder="Seleccione el estado civil"
              value={data.personal?.marital_status || ""}
              onChange={(value) =>
                handlePersonalChange("marital_status", value as MaritalStatus)
              }
              data={[
                { value: "Soltero", label: "Soltero/a" },
                { value: "Casado", label: "Casado/a" },
                { value: "Viudo", label: "Viudo/a" },
                { value: "Divorciado", label: "Divorciado/a" },
                { value: "Unión Libre", label: "Unión Libre" },
              ]}
              error={errors["personal.marital_status"]}
            />
            <Select
              label="Nivel de Educación"
              placeholder="Seleccione el nivel"
              value={data.personal?.education_level || ""}
              onChange={(value) =>
                handlePersonalChange("education_level", value as EducationLevel)
              }
              data={[
                { value: "Sin Educación", label: "Sin Educación" },
                { value: "Primaria Incompleta", label: "Primaria Incompleta" },
                { value: "Primaria Completa", label: "Primaria Completa" },
                {
                  value: "Secundaria Incompleta",
                  label: "Secundaria Incompleta",
                },
                { value: "Secundaria Completa", label: "Secundaria Completa" },
                { value: "Técnico", label: "Técnico" },
                {
                  value: "Universitario Incompleto",
                  label: "Universitario Incompleto",
                },
                {
                  value: "Universitario Completo",
                  label: "Universitario Completo",
                },
                { value: "Postgrado", label: "Postgrado" },
              ]}
              error={errors["personal.education_level"]}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Ocupación"
              placeholder="Profesión u oficio"
              value={data.personal?.occupation || ""}
              onChange={(e) =>
                handlePersonalChange("occupation", e.target.value)
              }
              error={errors["personal.occupation"]}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Teléfono de Emergencia"
              placeholder="Teléfono del contacto"
              value={data.personal?.emergency_phone || ""}
              onChange={(e) =>
                handlePersonalChange("emergency_phone", e.target.value)
              }
              error={errors["personal.emergency_phone"]}
            />
            <Textarea
              label="Observaciones"
              placeholder="Observaciones adicionales"
              value={data.personal?.observations || ""}
              onChange={(e) =>
                handlePersonalChange("observations", e.target.value)
              }
              minRows={2}
              error={errors["personal.observations"]}
            />
          </Group>

          <Group grow>
            <Select
              label="Género"
              placeholder="Seleccione el género"
              value={data.personal?.gender || ""}
              onChange={(value) =>
                handlePersonalChange("gender", value as Gender)
              }
              data={[
                { value: "Masculino", label: "Masculino" },
                { value: "Femenino", label: "Femenino" },
                { value: "Otro", label: "Otro" },
              ]}
              error={errors["personal.gender"]}
            />
            <TextInput
              label="Nombre del Padre"
              value={data.personal?.father_name || ""}
              onChange={(e) =>
                handlePersonalChange("father_name", e.target.value)
              }
              error={errors["personal.father_name"]}
            />
            <TextInput
              label="Nombre de la Madre"
              value={data.personal?.mother_name || ""}
              onChange={(e) =>
                handlePersonalChange("mother_name", e.target.value)
              }
              error={errors["personal.mother_name"]}
            />
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};
