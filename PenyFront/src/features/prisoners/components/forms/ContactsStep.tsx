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

export const ContactsStep: React.FC<ContactsStepProps> = ({
  data,
  onUpdate,
  errors = {},
}) => {
  const contacts = data.contacts || [];

  const handleAddContact = () => {
    onUpdate({
      contacts: [...contacts, { name: "", relationship: "", phone: "" }],
    });
  };

  const handleRemoveContact = (index: number) => {
    onUpdate({ contacts: contacts.filter((_, i) => i !== index) });
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    const updatedContacts = [...contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    onUpdate({ contacts: updatedContacts });
  };

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
};
