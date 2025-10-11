import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { ROUTES } from '../../../shared/config/routes';
import type { 
  FormData, 
  BasicInfoUpdate, 
  ContactInfoUpdate, 
  DocumentsUpdate 
} from '../types'; // 🔧 Importar tipos específicos

export const useNewPrisoner = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    basicInfo: {
      firstName: '',
      lastName: '',
      age: 0,
      identification: '',
      passport: '',
      fullName: '',
      idNumber: '',
      birthDate: '',
      gender: '',
      nationality: 'Boliviana',
      crime: '',
      sentence: '',
      cellBlock: '',
      legalStatus: 'En proceso',
      behavior: 'Bueno',
      workAssignment: ''
    },
    contactInfo: {
      emergencyContact: '',
      emergencyPhone: '',
      relationship: '',
      department: '',
      city: '',
      address: ''
    },
    documents: {
      photos: [],
      documents: [],
      medicalRecords: []
    }
  });

  // 🔧 Función para procesar datos de información básica
  const processBasicInfoData = useCallback((data: BasicInfoUpdate): BasicInfoUpdate => {
    const processedData: BasicInfoUpdate = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'age') {
        let ageValue = value as string | number;
        if (typeof ageValue === 'string') {
          ageValue = ageValue === '' ? 0 : parseInt(ageValue, 10);
        }
        processedData.age = isNaN(ageValue as number) ? 0 : (ageValue as number);
      } else {
        (processedData as Record<string, unknown>)[key] = value;
      }
    });
    
    return processedData;
  }, []);

  // 🔧 Función sobrecargada para manejar actualizaciones con tipado estricto
  const updateFormData = useCallback((
    section: keyof FormData,
    data: BasicInfoUpdate | ContactInfoUpdate | DocumentsUpdate
  ) => {
    setFormData(prev => {
      switch (section) {
        case 'basicInfo': {
          const processedData = processBasicInfoData(data as BasicInfoUpdate);
          return {
            ...prev,
            basicInfo: {
              ...prev.basicInfo,
              ...processedData
            }
          };
        }
        case 'contactInfo':
          return {
            ...prev,
            contactInfo: {
              ...prev.contactInfo,
              ...(data as ContactInfoUpdate)
            }
          };
        case 'documents':
          return {
            ...prev,
            documents: {
              ...prev.documents,
              ...(data as DocumentsUpdate)
            }
          };
        default:
          return prev;
      }
    });
  }, [processBasicInfoData]); // 🔧 Incluir dependencia

  // Validaciones por paso
  const canProceedToNext = useCallback((step: number): boolean => {
    switch (step) {
      case 0: {
        const { firstName, lastName, identification, birthDate, gender } = formData.basicInfo;
        return !!(firstName && lastName && identification && birthDate && gender);
      }
      case 1:
        return true;
      case 2:
        return true;
      default:
        return false;
    }
  }, [formData]);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    try {
      setIsSubmitting(true);

      if (!canProceedToNext(0)) {
        notifications.show({
          title: 'Error de validación',
          message: 'Por favor complete todos los campos básicos requeridos',
          color: 'red'
        });
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const newPrisoner = {
        id: Date.now().toString(),
        ...formData.basicInfo,
        fullName: `${formData.basicInfo.firstName} ${formData.basicInfo.lastName}`,
        status: 'Activo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        admissionDate: new Date().toISOString().split('T')[0],
        remainingSentence: formData.basicInfo.sentence,
        ...(formData.contactInfo.emergencyContact && {
          emergencyContact: formData.contactInfo.emergencyContact,
          emergencyPhone: formData.contactInfo.emergencyPhone,
          relationship: formData.contactInfo.relationship,
          location: {
            department: formData.contactInfo.department,
            city: formData.contactInfo.city,
            address: formData.contactInfo.address
          }
        })
      };

      console.log('Nuevo recluso creado:', newPrisoner);

      notifications.show({
        title: 'Recluso registrado exitosamente',
        message: `${newPrisoner.fullName} ha sido agregado al sistema`,
        color: 'green'
      });

      return true;
    } catch (error) {
      console.error('Error al crear recluso:', error);
      notifications.show({
        title: 'Error al registrar',
        message: 'No se pudo crear el expediente del recluso',
        color: 'red'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, canProceedToNext]);

  const handleCancel = useCallback(() => {
    navigate(ROUTES.PRISONERS);
  }, [navigate]);

  return {
    formData,
    updateFormData,
    isSubmitting,
    handleSubmit,
    handleCancel,
    canProceedToNext
  };
};