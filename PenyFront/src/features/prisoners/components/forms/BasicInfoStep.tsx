import React, { useCallback, useEffect, useMemo } from "react";
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
import { GenericCombobox } from "../../../../shared/components/GenericCombobox";
import { TextareaField } from "../../../../shared/components/TextareaField";
import { DatePickerInput } from "@mantine/dates";
import { parseISODate } from "./utils/dateUtils";
import { SelectWithOther } from "../../../../shared/components/SelectWithOther";
import {
  ProfilePhotoDropzone,
  FingerprintDropzone,
} from "../../../../shared/components/BelongingDropzone";
import { OptimizedTextInput } from "./OptimizedInput";
import "@mantine/dates/styles.css";
import "@mantine/core/styles.css";

interface BasicInfoStepProps {
  data: Partial<CreatePrisonerData>;
  onUpdate: (updates: Partial<CreatePrisonerData>) => void;
  onFileUpdate?: (
    fileType: "photo" | "fingerprintLeft" | "fingerprintRight",
    file: File
  ) => void;
  errors?: Record<string, string>;
  mode?: 'edit' | 'create';
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = React.memo(
  ({ data, onUpdate, onFileUpdate, errors = {}, mode  }) => {
    // Memoizar identity para evitar re-crear el objeto
    const identity = useMemo(() => data.identity || {}, [data.identity]);

    const handleMainDataChange = useCallback(
      (field: string, value: string | Date | number | undefined) => {
        onUpdate({ [field]: value });
      },
      [onUpdate]
    );

    const handleIdentityChange = useCallback(
      (field: string, value: string | Date | undefined) => {
        onUpdate({
          identity: {
            ...identity,
            [field]: value,
          },
        });
      },
      [onUpdate, identity]
    );

    useEffect(() => {
      console.log("BasicInfoStep data updated:", data);
    }, [data]);

    return (
      <Stack gap="lg">
        <Card withBorder padding="lg">
          <Title order={4} size="h5" mb="md">
            Información Principal
          </Title>
          <Stack gap="md">
            <InputGroup>
              <OptimizedTextInput
                label="Número de Registro Penitenciario"
                placeholder="Ej: REG-2024-001"
                value={data.registration_number || ""}
                onChange={(value) =>
                  handleMainDataChange("registration_number", value)
                }
                required
                error={errors.registration_number}
              />
              <DatePickerInput
                label="Fecha de Ingreso"
                placeholder="Seleccione la fecha"
                value={
                  data.admission_date
                    ? (typeof data.admission_date === 'string'
                        ? parseISODate(data.admission_date)
                        : data.admission_date)
                    : null
                }
                onChange={(date) =>
                  handleMainDataChange("admission_date", date ?? undefined)
                }
                error={errors.admission_date}
                disabled={mode === 'edit'}
                required
                maxDate={new Date()}
              />
            </InputGroup>
            <OptimizedTextInput
              label="Número de Expediente Fiscal"
              placeholder="Ej: EXP-2024-FISCAL-001"
              value={data.fiscal_file_number || ""}
              onChange={(value) =>
                handleMainDataChange("fiscal_file_number", value)
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
                  onFileUpdate?.("photo", file);
                }}
              />
              <FingerprintDropzone
                label="Huella Dactilar Izquierda"
                onFile={(file) => {
                  onFileUpdate?.("fingerprintLeft", file);
                }}
              />
              <FingerprintDropzone
                label="Huella Dactilar Derecha"
                onFile={(file) => {
                  onFileUpdate?.("fingerprintRight", file);
                }}
              />
            </InputGroup>
            <InputGroup>
              <OptimizedTextInput
                label="Apellidos"
                placeholder="Ingrese los apellidos"
                value={identity.surname || ""}
                onChange={(value) => handleIdentityChange("surname", value)}
                required
                error={errors["identity.surname"]}
              />
              <OptimizedTextInput
                label="Nombres"
                placeholder="Ingrese los nombres"
                value={identity.first_name || ""}
                onChange={(value) => handleIdentityChange("first_name", value)}
                required
                error={errors["identity.first_name"]}
              />
            </InputGroup>
            <InputGroup>
              <DatePickerInput
                label="Fecha de Nacimiento"
                placeholder="Seleccione la fecha"
                value={
                  identity.birth_date
                    ? typeof identity.birth_date === "string"
                      ? (() => {
                          const [year, month, day] = identity.birth_date
                            .split("-")
                            .map(Number);
                          return new Date(year, month - 1, day);
                        })()
                      : data.admission_date
                    : null
                }
                onChange={(date) =>
                  handleIdentityChange("birth_date", date ?? undefined)
                }
                maxDate={new Date()}
                required
                error={errors["identity.birth_date"]}
              />
              <OptimizedTextInput
                label="Lugar de Nacimiento"
                placeholder="Ciudad, Departamento"
                value={identity.birth_place || ""}
                onChange={(value) => handleIdentityChange("birth_place", value)}
                error={errors["identity.birth_place"]}
                required
              />
            </InputGroup>
            <TextareaField
              label="Domicilio/Residencia"
              placeholder="Dirección completa de residencia"
              value={identity.residence || ""}
              onChange={(e) =>
                handleIdentityChange("residence", e.target.value)
              }
              minRows={2}
              error={errors["identity.residence"]}
              required
              debounce={true}
            />
            <InputGroup>
              <SelectField
                label="Tipo de Ciudadanía"
                placeholder="Seleccione el tipo"
                value={identity.citizenship_type || "Local"}
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
              <OptimizedTextInput
                label="País de Origen"
                placeholder="Ej: Bolivia"
                value={identity.country_of_origin || ""}
                onChange={(value) =>
                  handleIdentityChange("country_of_origin", value)
                }
                error={errors["identity.country_of_origin"]}
                required
              />
            </InputGroup>
            <InputGroup>
              <GenericCombobox
                label="Nacionalidad"
                placeholder="Ej: Boliviana"
                value={data.identity?.nationality || ""}
                onChange={(value) => handleIdentityChange("nationality", value)}
                options={nationalityOptions}
                error={errors["identity.nationality"]}
                required
                debounce={true}
              />
              <SelectWithOther
                label="Tipo de Nacionalidad"
                required
                placeholder="Por nacimiento, naturalización, etc."
                value={identity.nationality_type || ""}
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
  }
);
