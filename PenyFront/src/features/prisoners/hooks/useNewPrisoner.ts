import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { ROUTES } from '../../../shared/config/routes';

interface BasicInfo {
  firstName: string;
  lastName: string;
  age: number;
  identification: string;
  passport: string;
  fullName: string;
  idNumber: string;
  birthDate: string;
  gender: string;
  nationality: string;
  crime: string;
  sentence: string;
  cellBlock: string;
  legalStatus: string;
  behavior: string;
  workAssignment: string;
}

interface ContactInfo {
  emergencyContact: string;
  emergencyPhone: string;
  relationship: string;
  department: string;
  city: string;
  address: string;
}

interface Documents {
  photos: File[];
  documents: File[];
  medicalRecords: File[];
}

interface FormData {
  basicInfo: BasicInfo;
  contactInfo: ContactInfo;
  documents: Documents;
}

export const useNewPrisoner = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado inicial del formulario
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

  // 🔧 Función para manejar actualizaciones con tipado estricto
  const updateFormData = useCallback((section: keyof FormData, data: any) => {
    setFormData(prev => {
      if (section === 'basicInfo') {
        return {
          ...prev,
          basicInfo: {
            ...prev.basicInfo,
            ...processBasicInfoData(data)
          }
        };
      }
      
      if (section === 'contactInfo') {
        return {
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            ...data
          }
        };
      }
      
      if (section === 'documents') {
        return {
          ...prev,
          documents: {
            ...prev.documents,
            ...data
          }
        };
      }
      
      return prev;
    });
  }, []);

  // 🔧 Función para procesar datos de información básica
  const processBasicInfoData = (data: any): Partial<BasicInfo> => {
    const processedData: Partial<BasicInfo> = {};
    
    Object.keys(data).forEach(key => {
      let value = data[key];
      
      // Conversión específica para age
      if (key === 'age') {
        if (typeof value === 'string') {
          value = value === '' ? 0 : parseInt(value, 10);
        }
        value = isNaN(value) ? 0 : value;
      }
      
      // Type assertion segura para las claves conocidas
      if (key in formData.basicInfo) {
        (processedData as any)[key] = value;
      }
    });
    
    return processedData;
  };

  // Validaciones por paso
  const canProceedToNext = useCallback((step: number): boolean => {
    switch (step) {
      case 0: // Información básica
        const { firstName, lastName, identification, birthDate, gender } = formData.basicInfo;
        return !!(firstName && lastName && identification && birthDate && gender);
      
      case 1: // Información de contacto (opcional)
        return true; // Contacto es opcional
      
      case 2: // Documentos (opcional)
        return true;
      
      default:
        return false;
    }
  }, [formData]);

  // Enviar formulario
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    try {
      setIsSubmitting(true);

      // Validar datos básicos requeridos
      if (!canProceedToNext(0)) {
        notifications.show({
          title: 'Error de validación',
          message: 'Por favor complete todos los campos básicos requeridos',
          color: 'red'
        });
        return false;
      }

      // Simular envío a API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear objeto del nuevo recluso
      const newPrisoner = {
        id: Date.now().toString(),
        ...formData.basicInfo,
        fullName: `${formData.basicInfo.firstName} ${formData.basicInfo.lastName}`,
        status: 'Activo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        admissionDate: new Date().toISOString().split('T')[0],
        remainingSentence: formData.basicInfo.sentence,
        // Solo incluir contactInfo si tiene datos
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

  // Cancelar y volver
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