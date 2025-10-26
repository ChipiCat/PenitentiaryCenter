import React from "react";
import { Stack, Title, Card } from "@mantine/core";
import type { Personal, Belonging, Child } from "../../../../shared/types";
import {
  maritalStatusOptions,
  educationLevelOptions,
  genderOptions,
  occupationList,
} from "../../../../shared/types/users/userEnumTypes";
import { InputGroup } from "../../../../shared/components/InputGroup";
import { GenericCombobox } from "../../../../shared/components/GenericCombobox";
import { SelectField } from "../../../../shared/components/SelectField";
import { TextInputField } from "../../../../shared/components/TextInputField";
import { TextareaField } from "../../../../shared/components/TextareaField";
import { SelectWithOther } from "../../../../shared/components/SelectWithOther";
import { DynamicListForm } from "../../../../shared/components/DynamicListForm";
import { BelongingsListForm } from "./BelongingsListForm";

interface PersonalInfoStepProps {
  data: {
    personal?: Partial<Personal>;
    belongings?: Partial<Belonging>[];
    child?: Partial<Child>[];
  };
  onUpdate: (updates: {
    personal?: Partial<Personal>;
    belongings?: Partial<Belonging>[];
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

  const belongings: Partial<Belonging>[] = data.belongings || [];

  const handleAddBelonging = () => {
    onUpdate({
      personal: data.personal,
      belongings: [
        ...belongings,
        {
          description: "",
          quantity: 1,
          condition: "",
          is_returned: false,
          attachment_url: "",
        },
      ],
      child: data.child,
    });
  };

  const handleRemoveBelonging = (index: number) => {
    const updated = belongings.filter((_, i) => i !== index);
    onUpdate({
      personal: data.personal,
      belongings: updated,
      child: data.child,
    });
  };

  const handleBelongingChange = (
    index: number,
    field: keyof Belonging,
    value: string | number | boolean | undefined
  ) => {
    const updated = [...belongings];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({
      personal: data.personal,
      belongings: updated,
      child: data.child,
    });
  };

  const children: Partial<Child>[] = data.child || [];

  const handleAddChild = () => {
    onUpdate({
      personal: data.personal,
      belongings: data.belongings,
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
      personal: data.personal,
      belongings: data.belongings,
      child: updatedChildren,
    });
  };

  const handleRemoveChild = (index: number) => {
    const updatedChildren = children.filter((_, i) => i !== index);
    onUpdate({
      personal: data.personal,
      belongings: data.belongings,
      child: updatedChildren,
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
              debounce={true}
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
              debounce={true}
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
              debounce={true}
            />
            <TextInputField
              label="Nombre de la Madre"
              value={data.personal?.mother_name || ""}
              onChange={(e) =>
                handlePersonalChange("mother_name", e.target.value)
              }
              error={errors["personal.mother_name"]}
              placeholder="Nombre completo de la madre"
              debounce={true}
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
        getSubtitle="Hijo/a"
      />
      <BelongingsListForm
        items={belongings}
        onAdd={handleAddBelonging}
        onRemove={handleRemoveBelonging}
        onChange={handleBelongingChange}
        errors={errors}
        addLabel="Agregar pertenencia"
      />
    </Stack>
  );
};
