import React, { useState, useCallback, useMemo } from 'react';
import { 
  Container, 
  Card, 
  Divider, 
  Stack,
  Alert,
  LoadingOverlay
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  User, 
  Users, 
  Building, 
  Phone,
  AlertCircle
} from 'lucide-react';

// Importar componentes
import { FormStepper } from './FormStepper';
import { FormNavigation } from './FormNavigation';
import { BasicInfoStep } from './BasicInfoStep';
import { PersonalInfoStep } from './PersonalInfoStep';
import { PenitentiaryInfoStep } from './PenitentiaryInfoStep';
import { ContactsStep } from './ContactsStep';

// ✅ IMPORTS ACTUALIZADOS - NUEVA ARQUITECTURA
import { 
  prisonersService,
  identityService,
  personalService,
  penitentiaryService,
  contactsService
} from '../../../../shared/services';

import type {
  CreatePrisonerData,
  CreateIdentityData,
  CreatePersonalData,
  CreatePenitentiaryData,
  CreateContactData,
  PrisonerBase,
  CitizenshipType,
  MaritalStatus,  
  EducationLevel  
} from '../../../../shared/types';

interface FormData {
  registration_number: string;
  admission_date: Date;
  fiscal_file_number?: string;
  status?: 'Activo' | 'Trasladado' | 'Liberado' | 'Archivado';
  
  identity?: {
    surname: string;
    first_name: string;
    birth_date?: Date;
    birth_place?: string;
    residence?: string;
    citizenship_type?: CitizenshipType;  // ✅ TIPO CENTRALIZADO
    country_of_origin?: string;
    nationality_type?: string;           // ✅ AGREGADO CAMPO FALTANTE
    nationality?: string;
  };
  
  personal?: {
    marital_status?: MaritalStatus;      
    education_level?: EducationLevel;    
    occupation?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    observations?: string;
  };
  
  penitentiary?: {
    category?: string;
    building_number?: string;
    cell_number?: string;
    bed_number?: string;
  };
  
  contacts?: {
    name: string;
    relationship: string;
    phone?: string;
    email?: string;
    address?: string;
    is_emergency?: boolean;
  }[];
}

interface PrisonerFormWizardProps {
  mode?: 'create' | 'edit';
  initialData?: Partial<FormData>;
  onSuccess?: (result: { prisoner: PrisonerBase; id: string }) => void;
  onCancel?: () => void;
}

export const PrisonerFormWizard: React.FC<PrisonerFormWizardProps> = ({
  mode = 'create',
  initialData = {},
  onSuccess,
  onCancel
}) => {
  // ==================== ESTADOS ====================
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    registration_number: '',
    admission_date: new Date(),
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==================== CONFIGURACIÓN DE PASOS ====================
  const steps = useMemo(() => [
    {
      step: 0,
      label: "Información Principal",
      description: "Datos básicos e identidad",
      icon: <User size={20} />
    },
    {
      step: 1,
      label: "Información Personal", 
      description: "Datos familiares y personales",
      icon: <Users size={20} />
    },
    {
      step: 2,
      label: "Ubicación Penitenciaria",
      description: "Edificio, celda y categoría", 
      icon: <Building size={20} />
    },
    {
      step: 3,
      label: "Contactos",
      description: "Contactos de emergencia",
      icon: <Phone size={20} />
    }
  ], []);

  // ==================== FUNCIONES DE UTILIDAD ====================
  const formatDateForAPI = useCallback((date: Date | undefined): string | undefined => {
    if (!date) return undefined;
    return date.toISOString().split('T')[0];
  }, []);

  // ==================== HANDLERS DE DATOS ====================
  const handleDataUpdate = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    
    // Limpiar errores del campo actualizado
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        delete newErrors[field];
        Object.keys(newErrors).forEach(errorKey => {
          if (errorKey.startsWith(`${field}.`)) {
            delete newErrors[errorKey];
          }
        });
      });
      return newErrors;
    });
  }, []);

  // ==================== VALIDACIONES ====================
  const isStepValid = useCallback((step: number, currentFormData: FormData): boolean => {
    switch (step) {
      case 0:
        return !!(
          currentFormData.registration_number?.trim() &&
          currentFormData.identity?.surname?.trim() &&
          currentFormData.identity?.first_name?.trim()
        );
      case 1:
        return true; // Información personal es opcional
      case 2:
        return true; // Información penitenciaria es opcional
      case 3:
        if (!currentFormData.contacts?.length) {
          return false;
        }
        return currentFormData.contacts.every(contact => 
          contact.name?.trim() && 
          contact.relationship?.trim() && 
          contact.phone?.trim()
        );
      default:
        return true;
    }
  }, []);

  const validateStepWithErrors = useCallback((step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.registration_number?.trim()) {
          stepErrors.registration_number = 'Número de registro es requerido';
        }
        if (!formData.identity?.surname?.trim()) {
          stepErrors['identity.surname'] = 'Apellidos son requeridos';
        }
        if (!formData.identity?.first_name?.trim()) {
          stepErrors['identity.first_name'] = 'Nombres son requeridos';
        }
        break;
      case 3:
        if (!formData.contacts?.length) {
          stepErrors.contacts = 'Al menos un contacto de emergencia es requerido';
        } else {
          formData.contacts.forEach((contact, index) => {
            if (!contact.name?.trim()) {
              stepErrors[`contacts.${index}.name`] = 'Nombre es requerido';
            }
            if (!contact.relationship?.trim()) {
              stepErrors[`contacts.${index}.relationship`] = 'Parentesco es requerido';
            }
            if (!contact.phone?.trim()) {
              stepErrors[`contacts.${index}.phone`] = 'Teléfono es requerido';
            }
          });
        }
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [formData]);

  const canGoNext = useMemo(() => {
    return isStepValid(activeStep, formData);
  }, [activeStep, formData, isStepValid]);

  // ==================== HANDLERS DE NAVEGACIÓN ====================
  const handleNext = useCallback(() => {
    if (validateStepWithErrors(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  }, [activeStep, validateStepWithErrors, steps.length]);

  const handlePrevious = useCallback(() => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  // ==================== SUBMIT HANDLER ====================
  const handleSubmit = useCallback(async () => {
    // Validar todos los pasos
    let allValid = true;
    for (let i = 0; i < steps.length; i++) {
      if (!validateStepWithErrors(i)) {
        allValid = false;
        setActiveStep(i);
        break;
      }
    }

    if (!allValid) {
      notifications.show({
        title: 'Errores en el formulario',
        message: 'Por favor corrige los errores antes de continuar',
        color: 'red',
        icon: <AlertCircle size={16} />
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ PASO 1: CREAR PRISIONERO BASE
      const prisonerData: CreatePrisonerData = {
        registration_number: formData.registration_number,
        admission_date: formatDateForAPI(formData.admission_date)!,
        fiscal_file_number: formData.fiscal_file_number,
        status: formData.status || 'Activo'
      };

      console.log('📤 Creando prisionero:', prisonerData);
      const prisoner = await prisonersService.createPrisoner(prisonerData);
      console.log('✅ Prisionero creado:', prisoner);

      const prisonerId = prisoner.id;

      // ✅ PASO 2: CREAR IDENTIDAD SI EXISTE
      if (formData.identity) {
        const identityData: CreateIdentityData = {
          first_name: formData.identity.first_name,
          surname: formData.identity.surname,
          birth_date: formatDateForAPI(formData.identity.birth_date),
          birth_place: formData.identity.birth_place,
          residence: formData.identity.residence,
          citizenship_type: formData.identity.citizenship_type,
          country_of_origin: formData.identity.country_of_origin,
          nationality: formData.identity.nationality
          // nationality_type se mapea automáticamente si es necesario
        };

        console.log('📤 Creando identidad:', identityData);
        await identityService.createIdentity(prisonerId, identityData);
        console.log('✅ Identidad creada');
      }

      // ✅ PASO 3: CREAR INFORMACIÓN PERSONAL SI EXISTE
      if (formData.personal) {
        const personalData: CreatePersonalData = {
          marital_status: formData.personal.marital_status,
          education_level: formData.personal.education_level,
          occupation: formData.personal.occupation,
          emergency_contact: formData.personal.emergency_contact,
          emergency_phone: formData.personal.emergency_phone,
          observations: formData.personal.observations
        };

        console.log('📤 Creando información personal:', personalData);
        await personalService.createPersonal(prisonerId, personalData);
        console.log('✅ Información personal creada');
      }

      // ✅ PASO 4: CREAR INFORMACIÓN PENITENCIARIA SI EXISTE
      if (formData.penitentiary) {
        const penitentiaryData: CreatePenitentiaryData = {
          category: formData.penitentiary.category,
          building_number: formData.penitentiary.building_number,
          cell_number: formData.penitentiary.cell_number,
          bed_number: formData.penitentiary.bed_number
        };

        console.log('📤 Creando información penitenciaria:', penitentiaryData);
        await penitentiaryService.createPenitentiary(prisonerId, penitentiaryData);
        console.log('✅ Información penitenciaria creada');
      }

      // ✅ PASO 5: CREAR CONTACTOS SI EXISTEN
      if (formData.contacts?.length) {
        console.log('📤 Creando contactos:', formData.contacts);
        for (const contact of formData.contacts) {
          const contactData: CreateContactData = {
            name: contact.name,
            relationship: contact.relationship,
            phone: contact.phone,
            email: contact.email,
            address: contact.address,
            is_emergency: contact.is_emergency ?? true
          };
          
          await contactsService.createContact(prisonerId, contactData);
        }
        console.log('✅ Contactos creados');
      }

      // ✅ ÉXITO
      notifications.show({
        title: 'Éxito',
        message: 'Prisionero registrado correctamente',
        color: 'green'
      });

      onSuccess?.({ prisoner, id: prisonerId });

    } catch (error) {
      console.error('❌ Error al guardar:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Ocurrió un error al guardar',
        color: 'red',
        icon: <AlertCircle size={16} />
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSuccess, steps.length, validateStepWithErrors, formatDateForAPI]);

  // ==================== RENDER DEL PASO ACTUAL ====================
  const renderCurrentStep = useCallback(() => {
    const commonProps = {
      data: formData,
      onUpdate: handleDataUpdate,
      errors
    };

    switch (activeStep) {
      case 0:
        return <BasicInfoStep {...commonProps} />;  // ✅ DEBERÍA FUNCIONAR AHORA
      case 1:
        return <PersonalInfoStep {...commonProps} />;
      case 2:
        return <PenitentiaryInfoStep {...commonProps} />;
      case 3:
        return <ContactsStep {...commonProps} />;
      default:
        return null;
    }
  }, [activeStep, formData, errors, handleDataUpdate]);

  // ==================== RENDER PRINCIPAL ====================
  return (
    <Container size="lg">
      <Card withBorder padding="xl" pos="relative">
        <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
        
        <Stack gap="md" mb="xl">
          <FormStepper 
            activeStep={activeStep} 
            steps={steps} 
          />
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
          finishButtonText={mode === 'create' ? 'Registrar Prisionero' : 'Actualizar Prisionero'}
        />
      </Card>
    </Container>
  );
};