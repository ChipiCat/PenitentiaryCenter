import React from "react";
import { Stack, Title, Card } from "@mantine/core";
import type { Personal, Belonging, Child } from "../../../../shared/types";
import {
  maritalStatusOptions,
  educationLevelOptions,
  genderOptions,
  occupationList,
  booleanOptions,
} from "../../../../shared/types/users/userEnumTypes";
import { InputGroup } from "../../../../shared/components/InputGroup";
import { GenericCombobox } from "../../../../shared/components/GenericCombobox";
import { SelectField } from "../../../../shared/components/SelectField";
import { TextInputField } from "../../../../shared/components/TextInputField";
import { TextareaField } from "../../../../shared/components/TextareaField";
import { SelectWithOther } from "../../../../shared/components/SelectWithOther";
import { BelongingDropzone } from "../../../../shared/components/BelongingDropzone";
import { DynamicListForm } from "../../../../shared/components/DynamicListForm";

interface PersonalInfoStepProps {
  data: {
    personal?: Partial<Personal>;
    belonging?: Partial<Belonging>;
    child?: Partial<Child>[];
  };
  onUpdate: (updates: {
    personal?: Partial<Personal>;
    belonging?: Partial<Belonging>;
    child?: Partial<Child>[];
  }) => void;
  errors?: Record<string, string>;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onUpdate,
  errors = {},
}) => {
  const childFields = [
    {
      label: "Nombre Completo",
      placeholder: "Nombre completo",
      key: "name",
      required: true,
    },
    {
      label: "Fecha de nacimiento",
      placeholder: "YYYY-MM-DD",
      key: "birth_date",
      required: true,
      type: "date",
    },
  ];

  const handlePersonalChange = (
    field: keyof Personal,
    value: string | number | Date | undefined
  ) => {
    onUpdate({
      personal: {
        ...data.personal,
        [field]: value,
      },
    });
  };

  const belonging: Partial<Belonging> = {
    description: data.belonging?.description ?? "",
    quantity: data.belonging?.quantity ?? 1,
    condition: data.belonging?.condition ?? "",
    is_returned: data.belonging?.is_returned ?? false,
    attachment_url: data.belonging?.attachment_url ?? "",
  };

  const handleBelongingChange = (
    field: keyof Belonging,
    value: string | number | boolean
  ) => {
    onUpdate({
      personal: data.personal,
      belonging: {
        ...belonging,
        [field]: value,
      },
      child: data.child,
    });
  };

  const children: Partial<Child>[] = data.child || [];

  const handleAddChild = () => {
    onUpdate({
      child: [...children, { name: "", birth_date: "" }],
    });
  };

  const handleChildrenChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedChildren = [...children];
    updatedChildren[index] = {
      ...updatedChildren[index],
      [field]: value,
    };
    onUpdate({
      child: updatedChildren,
      personal: data.personal,
      belonging: data.belonging,
    });
  };

  const handleRemoveChild = (index: number) => {
    const updatedChildren = children.filter((_, i) => i !== index);
    onUpdate({
      child: updatedChildren,
      personal: data.personal,
      belonging: data.belonging,
    });
  };

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md">
          Información Personal
        </Title>
        <Stack gap="md">
          <InputGroup>
            <SelectField
              label="Estado Civil"
              value={data.personal?.marital_status || ""}
              onChange={(value) =>
                handlePersonalChange("marital_status", value ?? undefined)
              }
              data={maritalStatusOptions}
              error={errors["personal.marital_status"]}
              required
              placeholder="Seleccione el estado civil"
            />
            <SelectWithOther
              label="Nivel de Educación"
              value={data.personal?.education_level || ""}
              onChange={(value) =>
                handlePersonalChange("education_level", value)
              }
              data={educationLevelOptions}
              error={errors["personal.education_level"]}
              required
              placeholder="Seleccione el nivel"
              otherLabel="Especifique Nivel de Educación"
              otherPlaceholder="Ingrese el nivel"
            />
          </InputGroup>
          <InputGroup>
            <SelectField
              label="Género"
              value={data.personal?.gender || ""}
              onChange={(value) =>
                handlePersonalChange("gender", value ?? undefined)
              }
              data={genderOptions}
              error={errors["personal.gender"]}
              required
              placeholder="Seleccione el género"
            />
            <GenericCombobox
              label="Ocupación"
              placeholder="Profesión u oficio"
              value={data.personal?.occupation || ""}
              onChange={(value) => handlePersonalChange("occupation", value)}
              options={occupationList}
              error={errors["personal.occupation"]}
              required
            />
          </InputGroup>
          <InputGroup>
            <TextareaField
              label="Observaciones"
              value={data.personal?.observations || ""}
              onChange={(e) =>
                handlePersonalChange("observations", e.target.value)
              }
              error={errors["personal.observations"]}
              minRows={2}
              placeholder="Observaciones adicionales"
            />
          </InputGroup>
          <InputGroup>
            <TextInputField
              label="Nombre del Padre"
              value={data.personal?.father_name || ""}
              onChange={(e) =>
                handlePersonalChange("father_name", e.target.value)
              }
              error={errors["personal.father_name"]}
              placeholder="Nombre completo del padre"
            />
            <TextInputField
              label="Nombre de la Madre"
              value={data.personal?.mother_name || ""}
              onChange={(e) =>
                handlePersonalChange("mother_name", e.target.value)
              }
              error={errors["personal.mother_name"]}
              placeholder="Nombre completo de la madre"
            />
          </InputGroup>
        </Stack>
      </Card>
      <DynamicListForm
        title="Descendencia"
        items={children}
        fields={childFields}
        onAdd={handleAddChild}
        onRemove={handleRemoveChild}
        onChange={handleChildrenChange}
        errors={errors}
        addLabel="Agregar hijo/a"
      />
      <Card withBorder padding="lg">
        <Title order={4} size="h5" mb="md">
          Pertenencias
        </Title>
        <Stack gap="md">
          <InputGroup>
            <TextInputField
              label="Descripción"
              value={belonging.description}
              onChange={(e) =>
                handleBelongingChange("description", e.target.value)
              }
              error={errors["personal.belonging.description"]}
              required
              placeholder="Ej: Reloj de pulsera"
            />
            <TextInputField
              label="Cantidad de Objetos"
              value={String(belonging.quantity)}
              onChange={(e) =>
                handleBelongingChange("quantity", Number(e.target.value))
              }
              error={errors["personal.belonging.quantity"]}
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
              onChange={(e) =>
                handleBelongingChange("condition", e.target.value)
              }
              error={errors["personal.belonging.condition"]}
              required
              placeholder="Ej: Buen estado"
            />
            <SelectField
              label="¿Devuelto?"
              value={belonging.is_returned ? "Sí" : "No"}
              onChange={(value) =>
                handleBelongingChange("is_returned", value === "Sí")
              }
              data={booleanOptions}
              error={errors["personal.belonging.returned"]}
              required
              placeholder="Seleccione"
            />
          </InputGroup>
          <InputGroup>
            <BelongingDropzone
              onFile={(file) => {
                const url = file ? URL.createObjectURL(file) : "";
                handleBelongingChange("attachment_url", url);
              }}
            />
          </InputGroup>
        </Stack>
      </Card>
    </Stack>
  );
};
