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
import { PenitentiaryInfoStep } from "./PenitentiaryInfoStep";
import { ContactsStep } from "./ContactsStep";
import type {
  CreatePrisonerData,
  PrisonerBase,
} from "../../../../shared/types/prisonerTypes";
import { usePrisonerFormHandlers } from "./usePrisonerFormHandler";

interface PrisonerFormWizardProps {
  mode?: "create" | "edit";
  initialData?: Partial<CreatePrisonerData>;
  onSuccess?: (result: { prisoner: PrisonerBase; id: string }) => void;
  onCancel?: () => void;
}

export const PrisonerFormWizard: React.FC<PrisonerFormWizardProps> = ({
  mode = "create",
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
    handlePrevious,
    handleNext,
    handleCancel,
    handleSubmit,
    steps,
  } = usePrisonerFormHandlers({ mode, initialData, onSuccess, onCancel });

  const renderCurrentStep = useCallback(() => {
    switch (activeStep) {
      case 0:
        return (
          <BasicInfoStep
            data={formData}
            onUpdate={handleDataUpdate}
            errors={errors}
          />
        );
      case 1:
        return (
          <PersonalInfoStep
            data={{ personal: formData.personal }}
            onUpdate={(updates) =>
              handleDataUpdate({ personal: updates.personal })
            }
            errors={errors}
          />
        );
      case 2:
        return (
          <PenitentiaryInfoStep
            data={{ penitentiary: formData.penitentiary }}
            onUpdate={(updates) => handleDataUpdate({ penitentiary: updates.penitentiary })}
            errors={errors}
          />
        );
      case 3:
        return (
          <ContactsStep
            data={{
              contacts: formData.contacts?.map(contact => ({
                ...contact,
                name: contact.name ?? '',
                phone: contact.phone ?? '',
                relationship: contact.relationship ?? '',
                // ...agrega aquí otras propiedades obligatorias de Contact
              }))
            }}
            onUpdate={(updates) => handleDataUpdate({ contacts: updates.contacts })}
            errors={errors}
          />
        );
      default:
        return null;
    }
  }, [activeStep, formData, errors, handleDataUpdate]);

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
