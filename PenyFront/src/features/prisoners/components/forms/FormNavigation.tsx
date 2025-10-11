import { 
  Group, 
  Button, 
  Text,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { ArrowLeft, ArrowRight, Save, X } from 'lucide-react';

interface FormNavigationProps {
  activeStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onFinish: () => void;
}

export const FormNavigation = ({
  activeStep,
  totalSteps,
  isSubmitting,
  canGoNext,
  onPrevious,
  onNext,
  onCancel,
  onFinish
}: FormNavigationProps) => {
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === totalSteps - 1;

  return (
    <Group justify="space-between" mt="xl" pt="md" style={{
      borderTop: '1px solid var(--mantine-color-gray-3)'
    }}>
      {/* Left side - Previous button */}
      <Group>
        {!isFirstStep ? (
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={onPrevious}
          >
            Anterior
          </Button>
        ) : (
          <div /> // Placeholder para mantener el espacio
        )}
      </Group>

      {/* Center - Step indicator for mobile */}
      <Group gap="xs" visibleFrom="xs" hiddenFrom="sm">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <ActionIcon
            key={index}
            variant={index === activeStep ? 'filled' : index < activeStep ? 'light' : 'subtle'}
            color={index <= activeStep ? 'blue' : 'gray'}
            size="sm"
            radius="xl"
          >
            {index < activeStep ? <ArrowRight size={12} /> : <Text size="xs">{index + 1}</Text>}
          </ActionIcon>
        ))}
      </Group>

      {/* Right side - Action buttons */}
      <Group>
        <Tooltip label="Perderás los cambios no guardados">
          <Button 
            variant="subtle" 
            color="red"
            leftSection={<X size={16} />}
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </Tooltip>
        
        {isLastStep ? (
          <Button 
            leftSection={<Save size={16} />}
            loading={isSubmitting}
            onClick={onFinish}
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            variant="gradient"
          >
            Registrar recluso
          </Button>
        ) : (
          <Button 
            rightSection={<ArrowRight size={16} />}
            onClick={onNext}
            disabled={!canGoNext}
          >
            Siguiente
          </Button>
        )}
      </Group>
    </Group>
  );
};