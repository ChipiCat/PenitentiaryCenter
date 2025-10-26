import React from "react";
import { Group, Button, ActionIcon, Tooltip, Text } from "@mantine/core";
import { ArrowLeft, ArrowRight, X, Save } from "lucide-react";

interface FormNavigationProps {
  activeStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onFinish: () => void;
  finishButtonText?: string;
  nextButtonText?: string;
  previousButtonText?: string;
  cancelButtonText?: string;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  activeStep,
  totalSteps,
  isSubmitting,
  canGoNext,
  onPrevious,
  onNext,
  onCancel,
  onFinish,
  finishButtonText = "Registrar recluso",
  nextButtonText = "Siguiente",
  previousButtonText = "Anterior",
  cancelButtonText = "Cancelar",
}) => {
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === totalSteps - 1;

  return (
    <Group
      justify="space-between"
      mt="xl"
      pt="md"
      style={{
        borderTop: "1px solid var(--mantine-color-gray-3)",
      }}
    >
      <Group>
        {!isFirstStep ? (
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={onPrevious}
            disabled={isSubmitting}
          >
            {previousButtonText}
          </Button>
        ) : (
          <div />
        )}
      </Group>

      {/* Center - Step indicator for mobile */}
      <Group gap="xs" hiddenFrom="sm">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <ActionIcon
            key={index}
            variant={
              index === activeStep
                ? "filled"
                : index < activeStep
                ? "light"
                : "subtle"
            }
            color={index <= activeStep ? "blue" : "gray"}
            size="sm"
            radius="xl"
            style={{ cursor: "default" }}
          >
            {index < activeStep ? (
              <ArrowRight size={12} />
            ) : (
              <Text size="xs">{index + 1}</Text>
            )}
          </ActionIcon>
        ))}
      </Group>

      <Group>
        <Tooltip label="Perderás los cambios no guardados">
          <Button
            variant="subtle"
            color="red"
            leftSection={<X size={16} />}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelButtonText}
          </Button>
        </Tooltip>

        {isLastStep ? (
          <Button
            leftSection={<Save size={16} />}
            loading={isSubmitting}
            onClick={onFinish}
            gradient={{ from: "blue", to: "cyan", deg: 45 }}
            variant="gradient"
          >
            {finishButtonText}
          </Button>
        ) : (
          <Button
            rightSection={<ArrowRight size={16} />}
            onClick={onNext}
            disabled={!canGoNext || isSubmitting}
          >
            {nextButtonText}
          </Button>
        )}
      </Group>
    </Group>
  );
};
