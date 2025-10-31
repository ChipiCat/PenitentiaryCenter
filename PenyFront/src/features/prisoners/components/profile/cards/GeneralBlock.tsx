import React from "react";
// Función para calcular la edad a partir de la fecha de nacimiento
function calcularEdad(fechaNacimientoIso?: string): string {
  if (!fechaNacimientoIso) return "No registrado";
  const nacimiento = new Date(fechaNacimientoIso);
  if (isNaN(nacimiento.getTime())) return "No registrado";
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return `${edad} años`;
}

import { Card, Group, Button, Text, Badge, ActionIcon, Tooltip, Image } from "@mantine/core";
import {
  UserCircle2,
  Building,
  FileDown,
  User,
  Plus,
  UserSquare,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import type { CompletePrisonerProfile } from "../../../../../shared/types";
import type { FileInfo } from "../../../../../shared/types/filesTypes";
import classes from "../../../../../shared/styles/GeneralBlock.module.css";
import { GenericInfoSection } from "../../../../../shared/components/user/GenericInfoSection";
import { GenericListSection } from "../../../../../shared/components/user/GenericListSection";

// Componente para previsualizar archivo de huella (imagen/pdf)
interface FingerprintFilePreviewProps {
  fileInfo: FileInfo;
  label: string;
}

const FingerprintFilePreview: React.FC<FingerprintFilePreviewProps> = ({ fileInfo, label }) => {
  if (!fileInfo || !fileInfo.url) return null;
  const isImage = fileInfo.mimeType?.startsWith("image/");
  const isPdf = fileInfo.mimeType === "application/pdf";
  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        component="a"
        href={fileInfo.url}
        target="_blank"
        rel="noopener noreferrer"
        variant="light"
        color="blue"
        size="lg"
        aria-label={label}
        style={{ padding: 2 }}
      >
        {isImage ? (
          <Image
            src={fileInfo.url}
            alt={label}
            width={32}
            height={32}
            radius="sm"
            style={{ objectFit: "cover" }}
          />
        ) : isPdf ? (
          <FileText size={28} />
        ) : (
          <FileText size={28} />
        )}
      </ActionIcon>
    </Tooltip>
  );
};

interface GeneralBlockProps {
  profile: CompletePrisonerProfile;
  onEdit?: () => void;
  onAddContact?: () => void;
  onAddBelonging?: () => void;
  onAddChild?: () => void;
}

export const GeneralBlock: React.FC<GeneralBlockProps> = ({
  profile,
  onEdit,
  onAddContact,
  onAddBelonging,
  onAddChild,
}) => (
  <Card withBorder padding="lg" h="100%">
    <GenericInfoSection
      icon={<UserCircle2 size={20} />}
      title="Información Principal"
      button={
        onEdit && (
          <Button variant="light" color="gray" onClick={onEdit}>
            Editar Información
          </Button>
        )
      }
      fieldsLeft={[
        {
          label: "Numero de Registro Penitenciario",
          value: profile.prisoner?.registration_number ?? "No registrado",
          mt: 0,
        },
        {
          label: "Fecha de ingreso",
          value: profile.prisoner?.admission_date
            ? new Date(profile.prisoner.admission_date).toLocaleDateString(
              "es-ES"
            )
            : "No registrado",
          mt: "xs",
        },
        {
          label: "Numero de Expediente Fiscal",
          value: profile.prisoner?.fiscal_file_number ?? "No registrado",
          mt: "xs",
        },
        {
          label: "Nombre Completo",
          value: `${profile.identity?.first_name ?? ""} ${profile.identity?.surname ?? ""
            }`,
        },
        {
          label: "Edad",
          value: calcularEdad(profile.identity?.birth_date),
          mt: "xs",
        },


      ]}
      fieldsRight={[
        {
          label: "Domicilio/Recidencia",
          value: profile.identity?.residence ?? "No registrado",
          mt: 0,
        },
        {
          label: "Tipo de Ciudadania",
          value: profile.identity?.citizenship_type ?? "No registrado",
          mt: "xs",
        },
        {
          label: "Pais de Origen",
          value: profile.identity?.country_of_origin ?? "No registrado",
          mt: "xs",
        },
        {
          label: "Nacionalidad",
          value: profile.identity?.nationality ?? "No registrado",
          mt: "xs",
        },
        {
          label: "Lugar de Nacimiento",
          value: profile.identity?.birth_place ?? "No registrado",
        },
      ]}
    />
    {(profile.identity?.right_fingerprint || profile.identity?.left_fingerprint )&& (
      <div className="flex flex-row gap-5 !ml-1.5  !mb-5">
        {profile.identity?.right_fingerprint && (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500">Huella Derecha</span>
            <FingerprintFilePreview
              fileInfo={profile.identity.right_fingerprint}
              label="Huella Derecha"
            />

          </div>
        )}
        {profile.identity?.left_fingerprint && (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500">Huella Izquierda</span>
            <FingerprintFilePreview
              fileInfo={profile.identity.left_fingerprint}
              label="Huella Izquierda"
            />
          </div>
        )}
      </div>
    )}

    <GenericInfoSection
      icon={<UserSquare size={20} />}
      title="Información Personal"
      button={
        onEdit && (
          <Button variant="light" color="gray" onClick={onEdit}>
            Editar Información
          </Button>
        )
      }
      fieldsLeft={[
        {
          label: "Estado Civil",
          value: profile.personal?.marital_status ?? "No registrado",
          mt: 0,
        },
        {
          label: "Nivel de Educación",
          value: profile.personal?.education_level ?? "No registrado",
          mt: "xs",
        },
        {
          label: "Género",
          value: profile.personal?.gender ?? "No registrado",
          mt: "xs",
        },
        {
          label: "Ocupación",
          value: profile.personal?.occupation ?? "No registrado",
        },

      ]}
      fieldsRight={[
        {
          label: "Nombre del Padre",
          value: profile.personal?.father_name ?? "No registrado",
          mt: 0,
        },
        {
          label: "Nombre de la Madre",
          value: profile.personal?.mother_name ?? "No registrado",
          mt: "xs",
        },
        {
          label: "Tipo de Documento de Identidad",
          value: profile.personal?.id_document_type ?? "No registrado",
          mt: "xs",
        },
        {
          label: "Numero de Documento de Identidad",
          value: profile.personal?.id_document_number ?? "No registrado",
          mt: "xs",
        },
        {
          label: "Idiomas",
          value: profile.personal?.languages ?? "No registrado",
          mt: "xs",
        },
      ]}
      leftSpan={6}
      rightSpan={6}
    />



    <GenericListSection
      icon={<User size={20} />}
      title="Hijos"
      button={
        <Button
          variant="outline"
          color="gray"
          onClick={onAddChild}
          leftSection={<Plus size={16} />}
          ml="xs"
        >
          Agregar Descendencia
        </Button>
      }
      items={profile.children}
      renderItem={(child, idx) => (
        <Group key={idx} justify="space-between" className={classes.childItem}>
          <Text>
            {child.name} ({child.birth_date})
          </Text>
        </Group>
      )}
      emptyText="No hay hijos registrados"
      className={classes.childrenList}
    />
    <GenericListSection
      icon={<FileDown size={20} />}
      title="Pertenencias al Ingreso"
      button={
        <Button
          variant="outline"
          color="gray"
          onClick={onAddBelonging}
          leftSection={<Plus size={16} />}
          ml="xs"
        >
          Agregar Pertenencia
        </Button>
      }
      items={profile.belongings}
      renderItem={(item, idx) => (
        <Group
          key={idx}
          justify="space-between"
          className={classes.belongingItem}
        >
          <Text>{item.description ?? JSON.stringify(item)}</Text>
          <Text>{item.quantity ?? ""}</Text>
          <Text>{item.is_returned ?? ""}</Text>
        </Group>
      )}
      emptyText="No hay pertenencias registradas"
      className={classes.belongingsList}
    />

    <GenericInfoSection
      icon={<Building size={20} />}
      title="Ubicación Penitenciaria"
      order={3}
      size="h4"
      fieldsLeft={[
        {
          label: "Categoría de Prisionero",
          value: profile.penitentiary?.category ? (
            <Badge
              variant="light"
              color={
                profile.penitentiary.category === "Derecho Común"
                  ? "blue"
                  : profile.penitentiary.category === "Prisión Preventiva"
                    ? "orange"
                    : "red"
              }
            >
              {profile.penitentiary.category}
            </Badge>
          ) : (
            <Text fw={500}>-</Text>
          ),
        },
        {
          label: "Edificio",
          value: profile.penitentiary?.building_number || "No asignado",
          mt: "md",
        },
      ]}
      fieldsRight={[
        {
          label: "Celda",
          value: profile.penitentiary?.cell_number || "No asignada",
        },
        {
          label: "Cama",
          value: profile.penitentiary?.bed_number || "No asignada",
          mt: "md",
        },
      ]}
      leftSpan={6}
      rightSpan={6}
    />

    <GenericListSection
      icon={<User size={20} />}
      title="Contactos de Emergencia"
      button={
        <Button
          variant="outline"
          color="gray"
          onClick={onAddContact}
          leftSection={<Plus size={16} />}
          ml="xs"
        >
          Agregar Contacto
        </Button>
      }
      items={profile.contacts}
      renderItem={(contact, idx) => (
        <Group
          key={idx}
          justify="space-between"
          className={classes.contactItem}
        >
          <Text fw={500}>{contact.name}</Text>
          <Text>
            {contact.relationship} - {contact.phone}
          </Text>
        </Group>
      )}
      emptyText="No hay contactos registrados"
      className={classes.contactsList}
    />
  </Card>
);
