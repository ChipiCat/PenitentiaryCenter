import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Button, 
  Group,
  Stack,
  Box,
  Affix,
  Transition
} from '@mantine/core';
import { useState } from 'react';
import { ArrowLeft, User, Phone, FileText } from 'lucide-react';
import { useViewportSize } from '@mantine/hooks';
import { BasicInfoStep } from '../components/forms/BasicInfoStep';
import { ContactInfoStep } from '../components/forms/ContactInfoStep';
import { DocumentsStep } from '../components/forms/DocumentsStep';
import { FormStepper } from '../components/forms/FormStepper';
import { FormNavigation } from '../components/forms/FormNavigation';
import { useNewPrisoner } from '../hooks/useNewPrisoner';

const NewPrisonerPage = () => {
  const { width } = useViewportSize();
  const isMobile = width < 768;
  
  const [activeStep, setActiveStep] = useState(0);
  const {
    formData,
    updateFormData,
    isSubmitting,
    handleSubmit,
    handleCancel,
    canProceedToNext
  } = useNewPrisoner();

  const steps = [
    { 
      step: 0, 
      label: 'Información Básica',
      description: 'Datos personales del interno',
      icon: <User size={16} />
    },
    { 
      step: 1, 
      label: 'Información de Contacto',
      description: 'Contactos de emergencia y familiares',
      icon: <Phone size={16} />
    },
    { 
      step: 2, 
      label: 'Documentos y Archivos',
      description: 'Subir documentos necesarios',
      icon: <FileText size={16} />
    }
  ];

  const handleNext = () => {
    if (canProceedToNext(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleFinish = async () => {
    const success = await handleSubmit();
    if (success) {
      handleCancel();
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <BasicInfoStep
            data={formData.basicInfo}
            onUpdate={(data) => updateFormData('basicInfo', data)}
          />
        );
      case 1:
        return (
          <ContactInfoStep
            data={formData.contactInfo}
            onUpdate={(data) => updateFormData('contactInfo', data)}
          />
        );
      case 2:
        return (
          <DocumentsStep
            data={formData.documents}
            onUpdate={(data) => updateFormData('documents', data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Paper p="lg" withBorder radius="md" shadow="xs">
            <Group mb="md">
              <Button
                variant="subtle"
                leftSection={<ArrowLeft size={16} />}
                onClick={handleCancel}
              >
                Volver a Reclusos
              </Button>
            </Group>
            
            <Title order={2} mb="xs">Registro de Nuevo Interno</Title>
            <Text c="dimmed" size="sm">
              Complete la información requerida para crear el expediente del interno
            </Text>
          </Paper>

          {/* Form Container */}
          <Paper p="xl" withBorder radius="md" shadow="xs">
            {/* Stepper */}
            <Box mb="xl">
              <FormStepper activeStep={activeStep} steps={steps} />
            </Box>

            {/* Step Content */}
            <Box style={{ minHeight: '400px' }}>
              {renderStepContent()}
            </Box>

            {/* Navigation */}
            <FormNavigation
              activeStep={activeStep}
              totalSteps={steps.length}
              isSubmitting={isSubmitting}
              canGoNext={canProceedToNext(activeStep)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onCancel={handleCancel}
              onFinish={handleFinish}
            />
          </Paper>
        </Stack>
      </Container>

      {/* Floating Action Button para móviles */}
      {isMobile && (
        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition transition="slide-up" mounted={activeStep < steps.length - 1}>
            {(transitionStyles) => (
              <Button
                style={transitionStyles}
                onClick={handleNext}
                disabled={!canProceedToNext(activeStep)}
                size="lg"
                radius="xl"
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                variant="gradient"
              >
                Siguiente
              </Button>
            )}
          </Transition>
        </Affix>
      )}
    </>
  );
};

export default NewPrisonerPage;