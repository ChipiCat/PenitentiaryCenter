import React, { useCallback, useMemo } from "react";
import { Stack, Title, Card } from "@mantine/core";
import type { Personal, Belonging, Child } from "../../../../shared/types";
import {
  maritalStatusOptions,
  educationLevelOptions,
  genderOptions,
  occupationList,
  idDocumentTypeOptions,
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

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = React.memo(({
  data,
  onUpdate,
  errors = {},
}) => {
  const personal = useMemo(() => data.personal || {}, [data.personal]);
  const belongings = useMemo(() => data.belongings || [], [data.belongings]);
  const children = useMemo(() => data.child || [], [data.child]);

  const childFields = useMemo(() => [
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
      type: "date" as const,
    },
  ], []);

  const handlePersonalChange = useCallback((
    field: keyof Personal,
    value: string | number | Date | undefined
  ) => {
    onUpdate({
      personal: {
        ...personal,
        [field]: value,
      },
      belongings: data.belongings,
      child: data.child,
    });
  }, [onUpdate, personal, data.belongings, data.child]);

  const handleAddBelonging = useCallback(() => {
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
  }, [onUpdate, data.personal, belongings, data.child]);

  const handleRemoveBelonging = useCallback((index: number) => {
    const updated = belongings.filter((_, i) => i !== index);
    onUpdate({
      personal: data.personal,
      belongings: updated,
      child: data.child,
    });
  }, [onUpdate, data.personal, belongings, data.child]);

  const handleBelongingChange = useCallback((
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
  }, [onUpdate, data.personal, belongings, data.child]);

  const handleAddChild = useCallback(() => {
    onUpdate({
      personal: data.personal,
      belongings: data.belongings,
      child: [...children, { name: "", birth_date: "" }],
    });
  }, [onUpdate, data.personal, data.belongings, children]);

  const handleChildrenChange = useCallback((
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
  }, [onUpdate, data.personal, data.belongings, children]);

  const handleRemoveChild = useCallback((index: number) => {
    const updatedChildren = children.filter((_, i) => i !== index);
    onUpdate({
      personal: data.personal,
      belongings: data.belongings,
      child: updatedChildren,
    });
  }, [onUpdate, data.personal, data.belongings, children]);

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
          <InputGroup>
            <SelectField
              label="Tipo de Documento de Identidad"
              value={data.personal?.id_document_type || ""}
              onChange={(value) =>
                handlePersonalChange("id_document_type", value ?? undefined)
              }
              data={idDocumentTypeOptions}
              error={errors["personal.id_document_type"]}
              required
              placeholder="Seleccione el tipo de documento"
            />
            <TextInputField
              label="Número de Documento de Identidad"
              value={data.personal?.id_document_number || ""}
              onChange={(e) =>
                handlePersonalChange("id_document_number", e.target.value)
              }
              error={errors["personal.id_document_number"]}
              placeholder="Número de documento de identidad"
              debounce={true}
              required
            />
          </InputGroup>
          <InputGroup>
            <TextInputField
              label="Idiomas"
              value={data.personal?.languages || ""}
              onChange={(e) =>
                handlePersonalChange("languages", e.target.value)
              }
              error={errors["personal.languages"]}
              placeholder="Idiomas"
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
});

PersonalInfoStep.displayName = 'PersonalInfoStep';
