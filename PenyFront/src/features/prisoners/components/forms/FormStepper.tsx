import React from 'react';
import { 
  Stepper, 
  Progress, 
  Text, 
  Group,
  Stack,
  ActionIcon,
  Box
} from '@mantine/core';
import { Check } from 'lucide-react';

interface Step {
  step: number;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface FormStepperProps {
  activeStep: number;
  steps: Step[];
}

export const FormStepper: React.FC<FormStepperProps> = ({ 
  activeStep, 
  steps 
}) => {
  const progressValue = ((activeStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Stepper para desktop */}
      <Box visibleFrom="md">
        <Stepper 
          active={activeStep} 
          size="sm"
          radius="lg"
          allowNextStepsSelect={false}
        >
          {steps.map((step) => (
            <Stepper.Step
              key={step.step}
              label={step.label}
              description={step.description}
              icon={
                activeStep > step.step ? (
                  <ActionIcon size="sm" variant="filled" color="green" radius="xl">
                    <Check size={14} />
                  </ActionIcon>
                ) : (
                  step.icon
                )
              }
              color={activeStep >= step.step ? 'blue' : 'gray'}
              completedIcon={
                <ActionIcon size="sm" variant="filled" color="green" radius="xl">
                  <Check size={14} />
                </ActionIcon>
              }
            />
          ))}
        </Stepper>
      </Box>

      {/* Progress bar para móvil */}
      <Stack gap="sm" hiddenFrom="md">
        <Group justify="space-between" align="center">
          <Group gap="xs" align="center">
            {steps[activeStep].icon}
            <div>
              <Text size="sm" fw={500}>
                {steps[activeStep].label}
              </Text>
              <Text size="xs" c="dimmed">
                {steps[activeStep].description}
              </Text>
            </div>
          </Group>
          <Text size="sm" c="blue" fw={500}>
            {activeStep + 1} de {steps.length}
          </Text>
        </Group>
        
        <div>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">Progreso</Text>
            <Text size="xs" c="dimmed">{Math.round(progressValue)}%</Text>
          </Group>
          <Progress 
            value={progressValue} 
            size="sm" 
            radius="xl"
            animated
            color="blue"
          />
        </div>
      </Stack>
    </>
  );
};