import React from "react";
import { Card, Text, Badge, ActionIcon,  Stack } from "@mantine/core";
import {
  UserCircle2,
  Building,
  UserSquare,
  
  Edit3,
} from "lucide-react";
import type { CompletePrisonerProfile } from "../../../../../shared/types";
import { GenericInfoSection } from "../../../../../shared/components/user/GenericInfoSection";
import { ChildrenSection } from "../sections/ChildrenSection";
import { BelongingsSection } from "../sections/BelongingsSection";
import { ContactsSection } from "../sections/ContactsSection";
import { useMainInfoEditor } from "../hooks/useMainInfoEditor";
import { MainInfoEditForm } from "../forms/MainInfoEditForm";
import { PersonalInfoEditForm } from "../forms/PersonalInfoEditForm";
import { usePenitentiaryEditor } from "../hooks/usePenitentiaryEditor";
import { PenitentiaryEditForm } from "../forms/PenitentiaryEditForm";
import FileView from "../../../../../shared/components/FileView";
import { identityService } from "../../../../../shared/services";
import { useGlobalContext } from "../../../../../shared/hooks/useGlobalContext";

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



interface GeneralBlockProps {
  profile: CompletePrisonerProfile;
  onRefresh?: () => void;
}

export const GeneralBlock: React.FC<GeneralBlockProps> = ({
  profile,
  onRefresh,
}) => {
  const { user } = useGlobalContext();
  // ==================== HOOK DE EDICIÓN ====================
  const {
    isEditingMain,
    isEditingPersonal,
    isLoading,
    errors,
    updateMainInfo,
    updatePersonalInfo,
    startEditingMain,
    cancelEditingMain,
    startEditingPersonal,
    cancelEditingPersonal,
  } = useMainInfoEditor({
    prisonerId: profile.prisoner.id,
    onSuccess: onRefresh,
  });

  const {
    isEditing: isEditingPenitentiary,
    isLoading: isLoadingPenitentiary,
    errors: errorsPenitentiary,
    updatePenitentiary,
    startEditing: startEditingPenitentiary,
    cancelEditing: cancelEditingPenitentiary,
  } = usePenitentiaryEditor({
    prisonerId: profile.prisoner.id,
    onSuccess: onRefresh,
  });

  // ==================== RENDERIZADO ====================
  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        {/* INFORMACIÓN PRINCIPAL - Vista o Edición */}
        {isEditingMain ? (
          <MainInfoEditForm
            profile={profile}
            onSave={updateMainInfo}
            onCancel={cancelEditingMain}
            isLoading={isLoading}
            errors={errors}
          />
        ) : (
          <GenericInfoSection
            icon={<UserCircle2 size={20} />}
            title="Información Principal"
            button={
              (user?.role === 'ADMIN' || user?.role === 'SECRETARY') ? (
              <ActionIcon
                variant="light"
                color="blue"
                size="lg"
                onClick={startEditingMain}
                aria-label="Editar información principal"
              >
                <Edit3 size={18} />
              </ActionIcon>
              ) : null}
            
            fieldsLeft={[
              {
                label: "Numero de Registro Penitenciario",
                value: profile.prisoner?.registration_number ?? "No registrado",
                mt: 0,
              },
              {
                label: "Fecha de ingreso",
                value: profile.prisoner?.admission_date
                  ? new Date(profile.prisoner.admission_date).toLocaleDateString("es-ES")
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
                value: `${profile.identity?.first_name ?? ""} ${profile.identity?.surname ?? ""}`,
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
        )}
        <span className="text-xs text-gray-500 !ml-2">Archivos</span> 
        {/* Huellas Dactilares - Solo en modo vista */}
        {!isEditingMain && (profile.identity?.right_fingerprint || profile.identity?.left_fingerprint || profile.identity?.photo_file) && (
          <div className="flex flex-row gap-5 !ml-1.5  !mb-5">
            {profile.identity?.right_fingerprint && (
             <FileView 
                fileInfo={profile.identity.right_fingerprint}
                label="Huella Derecha"
                updateFile={(file: File) => identityService.uploadFingerprint(profile.prisoner.id, file, 'right')}
                onSuccess={onRefresh}
                acceptPdf={false}
             />
            )}
            {profile.identity?.left_fingerprint && (
              <FileView 
                fileInfo={profile.identity.left_fingerprint}
                label="Huella Izquierda"
                updateFile={(file: File) => identityService.uploadFingerprint(profile.prisoner.id, file, 'left')}
                onSuccess={onRefresh}
                acceptPdf={false}
              />
            )}
            {profile.identity?.photo_file && (
              <FileView
                fileInfo={profile.identity.photo_file}
                label="Foto Prisionero"
                updateFile={(file: File) => identityService.uploadPhoto(profile.prisoner.id, file)}
                onSuccess={onRefresh}
                acceptPdf={false}
              />
            )}

                
            

          </div>
        )}

        {/* INFORMACIÓN PERSONAL - Vista o Edición */}
        {isEditingPersonal ? (
          <PersonalInfoEditForm
            profile={profile}
            onSave={updatePersonalInfo}
            onCancel={cancelEditingPersonal}
            isLoading={isLoading}
            errors={errors}
          />
        ) : (
          <GenericInfoSection
            icon={<UserSquare size={20} />}
            title="Información Personal"
            button={
              (user?.role === 'ADMIN' || user?.role === 'SECRETARY') ? (
              <ActionIcon
                variant="light"
                color="blue"
                size="lg"
                onClick={startEditingPersonal}
                aria-label="Editar información personal"
              >
                <Edit3 size={18} />
              </ActionIcon>
              ) : null
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
        )}
      </Card>

      {/* Sección de Hijos - Nuevo Componente */}
      <ChildrenSection
        prisonerId={profile.prisoner.id}
        children={profile.children}
        onUpdate={() => onRefresh?.()}
      />

      {/* Sección de Pertenencias - Nuevo Componente */}
      <BelongingsSection
        prisonerId={profile.prisoner.id}
        belongings={profile.belongings}
        onUpdate={() => onRefresh?.()}
      />

      <Card withBorder padding="lg">
        {/* UBICACIÓN PENITENCIARIA - Vista o Edición */}
        {isEditingPenitentiary ? (
          <PenitentiaryEditForm
            profile={profile}
            onSave={updatePenitentiary}
            onCancel={cancelEditingPenitentiary}
            isLoading={isLoadingPenitentiary}
            errors={errorsPenitentiary}
          />
        ) : (
          <GenericInfoSection
            icon={<Building size={20} color="blue" />}
            title="Ubicación Penitenciaria"
            order={3}
            size="h4"
            button={
              (user?.role === 'ADMIN' || user?.role === 'SECRETARY') && (
              <ActionIcon
                variant="light"
                color="blue"
                size="lg"
                onClick={startEditingPenitentiary}
                aria-label="Editar ubicación penitenciaria"
              >
                <Edit3 size={18} />
              </ActionIcon>
              )
            }
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
        )}
      </Card>

      {/* Sección de Contactos - Nuevo Componente */}
      <ContactsSection
        prisonerId={profile.prisoner.id}
        contacts={profile.contacts}
        onUpdate={() => onRefresh?.()}
      />
    </Stack>
  );
};
