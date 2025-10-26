import React, { useCallback, useMemo } from "react";
import { DynamicListForm } from "../../../../shared/components/DynamicListForm"; // Ajusta la ruta según tu proyecto

const contactFields = [
  {
    label: "Nombre Completo",
    placeholder: "Nombre y apellidos",
    key: "name",
    required: true,
  },
  {
    label: "Parentesco/Relación",
    placeholder: "Ej: Madre, Hermano, Esposa",
    key: "relationship",
    required: true,
  },
  {
    label: "Teléfono",
    placeholder: "Número de teléfono o celular",
    key: "phone",
    required: true,
  },
];

interface ContactsStepProps {
  data: {
    contacts?: Array<{
      name: string;
      relationship: string;
      phone: string;
    }>;
  };
  onUpdate: (updatedData: {
    contacts: Array<{ name: string; relationship: string; phone: string }>;
  }) => void;
  errors?: Record<string, string>;
}

export const ContactsStep: React.FC<ContactsStepProps> = React.memo(({
  data,
  onUpdate,
  errors = {},
}) => {
  // Memoizar datos para evitar re-crear arrays
  const contacts = useMemo(() => data.contacts || [], [data.contacts]);

  const handleAddContact = useCallback(() => {
    onUpdate({
      contacts: [...contacts, { name: "", relationship: "", phone: "" }],
    });
  }, [contacts, onUpdate]);

  const handleRemoveContact = useCallback((index: number) => {
    onUpdate({ contacts: contacts.filter((_, i) => i !== index) });
  }, [contacts, onUpdate]);

  const handleContactChange = useCallback((index: number, field: string, value: string) => {
    const updatedContacts = [...contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    onUpdate({ contacts: updatedContacts });
  }, [contacts, onUpdate]);

  return (
    <DynamicListForm
      title="Contactos de Emergencia"
      items={contacts}
      fields={contactFields}
      onAdd={handleAddContact}
      onRemove={handleRemoveContact}
      onChange={handleContactChange}
      errors={errors}
      addLabel="Agregar Contacto"
      getSubtitle="Contacto"
    />
  );
});

ContactsStep.displayName = 'ContactsStep';
