import React, { useCallback } from "react";
import {
  Container,
  Card,
  Stack,
  Divider,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import { AlertCircle } from "lucide-react";
import { FormStepper } from "./FormStepper";
import { FormNavigation } from "./FormNavigation";
import { BasicInfoStep } from "./BasicInfoStep";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { MedicalStep } from "./MedicalStep";
import { PenitentiaryInfoStep } from "./PenitentiaryInfoStep";
import { ContactsStep } from "./ContactsStep";
import { LegalCaseStep } from "./LegalCaseStep";
import type {
  CreatePrisonerData,
  PrisonerBase,
} from "../../../../shared/types/prisonerTypes";
import { usePrisonerFormHandlers } from "./usePrisonerFormHandler";

interface PrisonerFormWizardProps {
  mode?: "create" | "edit";
  prisonerId?: string; // ID del prisionero cuando es modo edición
  initialData?: Partial<CreatePrisonerData>;
  onSuccess?: (result: { prisoner: PrisonerBase; id: string }) => void;
  onCancel?: () => void;
}

export const PrisonerFormWizard: React.FC<PrisonerFormWizardProps> = ({
  mode = "create",
  prisonerId,
  initialData = {},
  onSuccess,
  onCancel,
}) => {
  const {
    formData,
    errors,
    activeStep,
    isSubmitting,
    canGoNext,
    handleDataUpdate,
    handleFileUpdate,
    handlePrevious,
    handleNext,
    handleCancel,
    handleSubmit,
    steps,
  } = usePrisonerFormHandlers({ mode, prisonerId, initialData, onSuccess, onCancel });

  const renderCurrentStep = useCallback(() => {
    switch (activeStep) {
      case 0:
        return (
          <BasicInfoStep
            data={formData}
            onUpdate={handleDataUpdate}
            onFileUpdate={handleFileUpdate}
            errors={errors}
          />
        );
      case 1:
        return (
          <PersonalInfoStep
            data={{
              personal: formData.personal,
              belongings: formData.belongings,
              child: formData.child,
            }}
            onUpdate={handleDataUpdate}
            errors={errors}
          />
        );
      case 2:
        return (
          <MedicalStep
            data={{ medical_record: formData.medical_record }}
            onUpdate={(updates) =>
              handleDataUpdate({ medical_record: updates.medical_record })
            }
            errors={errors}
          />
        );
      case 3:
        return (
          <PenitentiaryInfoStep
            data={{ penitentiary: formData.penitentiary }}
            onUpdate={(updates) =>
              handleDataUpdate({ penitentiary: updates.penitentiary })
            }
            errors={errors}
          />
        );
      case 4:
        return (
          <ContactsStep
            data={{
              contacts: formData.contacts?.map((contact) => ({
                ...contact,
                name: contact.name ?? "",
                phone: contact.phone ?? "",
                relationship: contact.relationship ?? "",
              })),
            }}
            onUpdate={(updates) =>
              handleDataUpdate({ contacts: updates.contacts })
            }
            errors={errors}
          />
        );
      case 5:
        return (
          <LegalCaseStep
            data={{
              initialCase: {
                case_number: formData.legal?.case_number ?? "",
                case_type: formData.legal?.case_type ?? "",
                court: formData.legal?.court ?? "",
                judge: formData.legal?.judge ?? "",
                status: formData.legal?.status ?? "",
                start_date: formData.legal?.start_date ?? "",
                end_date: formData.legal?.end_date ?? "",
                description: formData.legal?.description ?? "",
              }
            }}
            onUpdate={(updates) => handleDataUpdate({ legal: updates.initialCase })}
            errors={errors}
          />
        );
      default:
        return null;
    }
  }, [activeStep, formData, errors, handleDataUpdate, handleFileUpdate]);

  return (
    <Container size="lg">
      <Card withBorder padding="xl" pos="relative">
        <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
        <Stack gap="md" mb="xl">
          <FormStepper activeStep={activeStep} steps={steps} />
        </Stack>
        <Divider mb="xl" />
        {Object.keys(errors).length > 0 && (
          <Alert
            icon={<AlertCircle size={16} />}
            color="red"
            mb="lg"
            title="Errores en el formulario"
          >
            Por favor corrige los campos marcados en rojo.
          </Alert>
        )}
        <Stack gap="lg" mb="xl">
          {renderCurrentStep()}
        </Stack>
        <Divider mt="xl" />
        <FormNavigation
          activeStep={activeStep}
          totalSteps={steps.length}
          isSubmitting={isSubmitting}
          canGoNext={canGoNext}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onCancel={handleCancel}
          onFinish={handleSubmit}
          finishButtonText={
            mode === "create" ? "Registrar Prisionero" : "Actualizar Prisionero"
          }
        />
      </Card>
    </Container>
  );
};
