import React from "react";
import { Stack, Title, Card } from "@mantine/core";
import type {
  CreatePrisonerData,
  CitizenshipType,
} from "../../../../shared/types";
import {
  nationalityOptions,
  nationalityTypeOptions,
  citizenshipTypeOptions,
} from "../../../../shared/types/users/userEnumTypes";
import { InputGroup } from "../../../../shared/components/InputGroup";
import { SelectField } from "../../../../shared/components/SelectField";
import { TextInputField } from "../../../../shared/components/TextInputField";
import { TextareaField } from "../../../../shared/components/TextareaField";
import { DatePickerInput } from "@mantine/dates";
import { SelectWithOther } from "../../../../shared/components/SelectWithOther";
import { ProfilePhotoDropzone, FingerprintDropzone } from "../../../../shared/components/BelongingDropzone";
import "@mantine/dates/styles.css";
import "@mantine/core/styles.css";

interface BasicInfoStepProps {
  data: Partial<CreatePrisonerData> & {
    identity?: {
      surname?: string;
      first_name?: string;
      birth_date?: Date;
      birth_place?: string;
      residence?: string;
      citizenship_type?: CitizenshipType;
      country_of_origin?: string;
      nationality_type?: string;
      nationality?: string;
      profile_photo_url?: string;
      fingerprint_right_url?: string;
      fingerprint_left_url?: string;
    };
  };
  onUpdate: (
    updates: Partial<CreatePrisonerData> & {
      identity?: Partial<BasicInfoStepProps["data"]["identity"]>;
    }
  ) => void;
  errors?: Record<string, string>;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onUpdate,
  errors = {},
}) => {
  const handleMainDataChange = (
    field: string,
    value: string | Date | number | undefined
  ) => {
    onUpdate({ [field]: value });
  };

  const handleIdentityChange = (
    field: keyof NonNullable<BasicInfoStepProps["data"]["identity"]>,
    value: string | Date | undefined
  ) => {
    onUpdate({
      identity: {
        ...data.identity,
        [field]: value,
      },
    });
  };

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md">
          Información Principal
        </Title>
        <Stack gap="md">
          <InputGroup>
            <TextInputField
              label="Número de Registro Penitenciario"
              placeholder="Ej: REG-2024-001"
              value={data.registration_number || ""}
              onChange={(e) =>
                handleMainDataChange("registration_number", e.target.value)
              }
              required
              error={errors.registration_number}
            />
            <DatePickerInput
              label="Fecha de Ingreso"
              placeholder="Seleccione la fecha"
              value={data.admission_date || null}
              onChange={(date) =>
                handleMainDataChange("admission_date", date ?? undefined)
              }
              error={errors.admission_date}
              required
              maxDate={new Date()}
            />
          </InputGroup>
          <TextInputField
            label="Número de Expediente Fiscal"
            placeholder="Ej: EXP-2024-FISCAL-001"
            value={data.fiscal_file_number || ""}
            onChange={(e) =>
              handleMainDataChange("fiscal_file_number", e.target.value)
            }
            error={errors.fiscal_file_number}
            required
          />
        </Stack>
      </Card>

      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md">
          Información de Identidad
        </Title>
        <Stack gap="md">
          <InputGroup>
            <ProfilePhotoDropzone
              onFile={(file) => {
                handleIdentityChange(
                  "profile_photo_url",
                  URL.createObjectURL(file)
                );
              }}
            />
            <FingerprintDropzone
              label="Huella Dactilar Izquierda"
              onFile={(file) => {
                handleIdentityChange(
                  "fingerprint_left_url",
                  URL.createObjectURL(file)
                );
              }}
            />
            <FingerprintDropzone
              label="Huella Dactilar Derecha"
              onFile={(file) => {
                handleIdentityChange(
                  "fingerprint_right_url",
                  URL.createObjectURL(file)
                );
              }}
            />
          </InputGroup>
          <InputGroup>
            <TextInputField
              label="Apellidos"
              placeholder="Ingrese los apellidos"
              value={data.identity?.surname || ""}
              onChange={(e) => handleIdentityChange("surname", e.target.value)}
              required
              error={errors["identity.surname"]}
            />
            <TextInputField
              label="Nombres"
              placeholder="Ingrese los nombres"
              value={data.identity?.first_name || ""}
              onChange={(e) =>
                handleIdentityChange("first_name", e.target.value)
              }
              required
              error={errors["identity.first_name"]}
            />
          </InputGroup>
          <InputGroup>
            <DatePickerInput
              label="Fecha de Nacimiento"
              placeholder="Seleccione la fecha"
              value={data.identity?.birth_date || null}
              onChange={(date) =>
                handleIdentityChange("birth_date", date ?? undefined)
              }
              maxDate={new Date()}
              required
              error={errors["identity.birth_date"]}
            />
            <TextInputField
              label="Lugar de Nacimiento"
              placeholder="Ciudad, Departamento"
              value={data.identity?.birth_place || ""}
              onChange={(e) =>
                handleIdentityChange("birth_place", e.target.value)
              }
              error={errors["identity.birth_place"]}
              required
            />
          </InputGroup>
          <TextareaField
            label="Domicilio/Residencia"
            placeholder="Dirección completa de residencia"
            value={data.identity?.residence || ""}
            onChange={(e) => handleIdentityChange("residence", e.target.value)}
            minRows={2}
            error={errors["identity.residence"]}
            required
          />
          <InputGroup>
            <SelectField
              label="Tipo de Ciudadanía"
              placeholder="Seleccione el tipo"
              value={data.identity?.citizenship_type || ""}
              onChange={(value) =>
                handleIdentityChange(
                  "citizenship_type",
                  value as CitizenshipType
                )
              }
              data={citizenshipTypeOptions}
              error={errors["identity.citizenship_type"]}
              required
            />
            <TextInputField
              label="País de Origen"
              placeholder="Ej: Bolivia"
              value={data.identity?.country_of_origin || ""}
              onChange={(e) =>
                handleIdentityChange("country_of_origin", e.target.value)
              }
              error={errors["identity.country_of_origin"]}
              required
            />
          </InputGroup>
          <InputGroup>
            <SelectWithOther
              label="Nacionalidad"
              required
              placeholder="Ej: Boliviana"
              value={data.identity?.nationality || ""}
              onChange={(value) => handleIdentityChange("nationality", value)}
              data={nationalityOptions}
              error={errors["identity.nationality"]}
              otherLabel="Especifique Nacionalidad"
              otherPlaceholder="Ingrese la nacionalidad"
            />
            <SelectWithOther
              label="Tipo de Nacionalidad"
              required
              placeholder="Por nacimiento, naturalización, etc."
              value={data.identity?.nationality_type || ""}
              onChange={(value) =>
                handleIdentityChange("nationality_type", value)
              }
              data={nationalityTypeOptions}
              error={errors["identity.nationality_type"]}
              otherLabel="Especifique Tipo de Nacionalidad"
              otherPlaceholder="Ingrese el tipo"
            />
          </InputGroup>
        </Stack>
      </Card>
    </Stack>
  );
};
