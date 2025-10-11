import { 
  Stepper, 
  Box, 
  Text, 
  Title, 
  Progress,
  Group,
  ThemeIcon,
  Stack
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

export const FormStepper = ({ activeStep, steps }: FormStepperProps) => {
  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Desktop Stepper */}
      <Box visibleFrom="md">
        <Stepper 
          active={activeStep} 
          size="md"
          allowNextStepsSelect={false}
          orientation="horizontal"
          iconSize={40}
          styles={{
            step: {
              transition: 'all 200ms ease',
            },
            stepIcon: {
              backgroundColor: 'var(--mantine-color-gray-1)',
              border: '2px solid var(--mantine-color-gray-3)',
              '&[data-completed]': {
                backgroundColor: 'var(--mantine-color-green-6)',
                borderColor: 'var(--mantine-color-green-6)',
              },
              '&[data-progress]': {
                backgroundColor: 'var(--mantine-color-blue-6)',
                borderColor: 'var(--mantine-color-blue-6)',
              }
            },
            stepBody: {
              marginTop: '8px'
            }
          }}
        >
          {steps.map((step) => (
            <Stepper.Step 
              key={step.step}
              label={
                <Text fw={500} size="sm">
                  {step.label}
                </Text>
              }
              description={
                <Text size="xs" c="dimmed">
                  {step.description}
                </Text>
              }
              icon={
                activeStep > step.step ? (
                  <Check size={20} />
                ) : (
                  step.icon
                )
              }
            />
          ))}
        </Stepper>
      </Box>

      {/* Mobile Progress Indicator */}
      <Box hiddenFrom="md">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Paso {activeStep + 1} de {steps.length}
              </Text>
              <Title order={3} size="h4" mt={4}>
                {steps[activeStep].label}
              </Title>
              <Text size="sm" c="dimmed" mt={2}>
                {steps[activeStep].description}
              </Text>
            </Box>
            <ThemeIcon
              size="lg"
              variant="light"
              color={activeStep === steps[activeStep].step ? 'blue' : 'green'}
            >
              {activeStep > steps[activeStep].step ? (
                <Check size={20} />
              ) : (
                steps[activeStep].icon
              )}
            </ThemeIcon>
          </Group>
          
          <Box>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">Progreso</Text>
              <Text size="xs" c="dimmed">{Math.round(progress)}%</Text>
            </Group>
            <Progress 
              value={progress} 
              size="sm" 
              radius="md"
              color="blue"
              animated={activeStep < steps.length - 1}
            />
          </Box>
        </Stack>
      </Box>
    </>
  );
};