import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Stack, Alert, Button, Group } from "@mantine/core";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { completeProfileService } from "../../../shared/services";
import type { CompletePrisonerProfile, CreatePrisonerData } from "../../../shared/types";
import { ROUTES } from "../../../shared/config/routes";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileContent } from "../components/profile/ProfileContent";
import { LoadingState } from "../../../shared/components/LoadingState";
import { exportPrisonerPdf } from "../components/profile/exportPrisonerPdf";
import { PrisonerFormWizard } from "../components/forms/PrisonerFormWizard";
import { parseISODate } from "../components/forms/utils/dateUtils";

/**
 * Convierte un perfil completo al formato esperado por el wizard de edición.
 * Las fechas se mantienen como strings except para identity.birth_date que acepta Date | string.
 * 
 * @param profile - Perfil completo del prisionero desde el backend
 * @returns Datos parciales en formato CreatePrisonerData para el wizard
 */
const convertProfileToFormData = (profile: CompletePrisonerProfile): Partial<CreatePrisonerData> => {
  return {
    registration_number: profile.prisoner.registration_number,
    admission_date: profile.prisoner.admission_date,
    fiscal_file_number: profile.prisoner.fiscal_file_number,
    status: profile.prisoner.status,
    
    // Identidad - birth_date puede ser Date o string
    identity: profile.identity ? {
      surname: profile.identity.surname,
      first_name: profile.identity.first_name,
      birth_date: parseISODate(profile.identity.birth_date) ?? undefined,
      birth_place: profile.identity.birth_place,
      residence: profile.identity.residence,
      citizenship_type: profile.identity.citizenship_type,
      country_of_origin: profile.identity.country_of_origin,
      nationality: profile.identity.nationality,
      nationality_type: profile.identity.nationality_type,
    } : undefined,
    
    // Datos personales
    personal: profile.personal ? {
      gender: profile.personal.gender,
      father_name: profile.personal.father_name,
      mother_name: profile.personal.mother_name,
      marital_status: profile.personal.marital_status,
      education_level: profile.personal.education_level,
      occupation: profile.personal.occupation,
      languages: profile.personal.languages,
      id_document_type: profile.personal.id_document_type,
      id_document_number: profile.personal.id_document_number,
      emergency_contact: profile.personal.emergency_contact,
      emergency_phone: profile.personal.emergency_phone,
     
    } : undefined,
    
    // Penitenciario
    penitentiary: profile.penitentiary ? {
      building_number: profile.penitentiary.building_number,
      cell_number: profile.penitentiary.cell_number,
      bed_number: profile.penitentiary.bed_number,
      category: profile.penitentiary.category,
    } : undefined,
    
    // Registros médicos - mantener fechas como string
    medical_record: profile.medical_records && profile.medical_records.length > 0 
      ? profile.medical_records.map(record => ({
          id: record.id,
          doctor_name: record.doctor_name,
          examination_date: record.examination_date,
          reference_number: record.reference_number,
          notes: record.notes,
        }))
      : undefined,
    
    // Contactos
    contacts: profile.contacts && profile.contacts.length > 0
      ? profile.contacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship,
          address: contact.address,
        }))
      : undefined,
    
    // Hijos - mapear name a full_name, mantener birth_date como string
    child: profile.children && profile.children.length > 0
      ? profile.children.map(child => ({
          id: child.id,
          name: child.name, // Child type usa 'name', no 'full_name'
          birth_date: child.birth_date,
        }))
      : undefined,
    
    // Pertenencias
    belongings: profile.belongings && profile.belongings.length > 0
      ? profile.belongings.map(belonging => ({
          id: belonging.id,
          description: belonging.description,
          quantity: belonging.quantity,
          condition: belonging.condition,
        }))
      : undefined,
    
    // Casos legales - mantener fechas como string para CaseFormData
    cases: profile.cases && profile.cases.length > 0
      ? profile.cases.map(caseItem => ({
          id: caseItem.id,
          case_number: caseItem.case_number,
          crime: caseItem.crime,
          status: caseItem.status,
          start_date: caseItem.start_date,
          end_date: caseItem.end_date,
          court_name: caseItem.court_name,
          judge_name: caseItem.judge_name,
          sentence_years: caseItem.sentence_years,
          remarks: caseItem.remarks,
          mandates: [], // Los mandatos se cargan por separado en el wizard
        }))
      : undefined,
  };
};

export const PrisonerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CompletePrisonerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [tabValue, setTabValue] = useState<string>("general");

  const handleTabChange = (value: string | null) => {
    if (value) setTabValue(value);
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        setError("ID de prisionero no proporcionado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Cargando perfil del prisionero:", id);

        const data = await completeProfileService.getCompleteProfile(id);
        if (data) {
          setProfile(data);
          console.log("✅ Perfil cargado:", data);
        } else {
          setError("Prisionero no encontrado");
        }
      } catch (err) {
        setError("Error al cargar el perfil del prisionero");
        console.error("❌ Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  useEffect(() => {
    const handleExportPDF = () => {
      if (profile) {
        const fecha = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", "_")
          .replace(/:/g, "-");
        exportPrisonerPdf(profile, fecha);
      }
    };
    window.addEventListener("SIGEPEN-export-recluso-pdf", handleExportPDF);
    return () =>
      window.removeEventListener("SIGEPEN-export-recluso-pdf", handleExportPDF);
  }, [profile]);

  const handleBack = () => {
    navigate(ROUTES.PRISONERS);
  };

  const handleEdit = () => {
    console.log("📝 Editar prisionero:", id);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    console.log("❌ Cancelar edición");
    setIsEditMode(false);
  };

  const handleSuccessEdit = async (result: { prisoner: any; id: string }) => {
    console.log("✅ Prisionero actualizado exitosamente:", result);
    
    // Recargar el perfil completo
    if (id) {
      try {
        const updatedProfile = await completeProfileService.getCompleteProfile(id);
        setProfile(updatedProfile);
      } catch (err) {
        console.error("Error al recargar perfil:", err);
      }
    }
    
    setIsEditMode(false);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !profile) {
    return (
      <Container size="lg">
        <Stack gap="lg">
          <Alert icon={<AlertCircle size={16} />} color="red" title="Error">
            {error || "No se pudo cargar el perfil del prisionero"}
          </Alert>
          <Group>
            <Button
              onClick={handleBack}
              leftSection={<ArrowLeft size={16} />}
              variant="light"
            >
              Volver a la lista
            </Button>
          </Group>
        </Stack>
      </Container>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="max-w-[1080px] w-full mx-auto flex flex-col gap-5">
        <ProfileHeader
          profile={profile}
          onEdit={handleEdit}
          onBack={handleBack}
          tabValue={tabValue}
          onTabChange={handleTabChange}
          isEditMode={isEditMode}
        />
        
        {isEditMode ? (
          // Modo edición: muestra el wizard en lugar de las tabs
          <PrisonerFormWizard 
            mode="edit"
            prisonerId={profile.prisoner.id}
            initialData={convertProfileToFormData(profile)}
            onSuccess={handleSuccessEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          // Modo visualización: muestra las tabs normales
          <>
            {tabValue === "general" && (
              <ProfileContent.GeneralBlock profile={profile} />
            )}
            {tabValue === "medical" && <ProfileContent.Medical profile={profile} />}
            {tabValue === "legal" && <ProfileContent.Legal profile={profile} />}
            {tabValue === "activity" && (
              <ProfileContent.Activity profile={profile} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
