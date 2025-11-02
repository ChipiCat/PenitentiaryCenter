import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { prisonersService } from '../../../../../shared/services/prisonersService';
import { identityService } from '../../../../../shared/services/identityService';
import { personalService } from '../../../../../shared/services/personalService';
import type { UpdatePrisonerData } from '../../../../../shared/types/prisonerTypes';
import type { UpdateIdentityData } from '../../../../../shared/types/identityTypes';
import type { UpdatePersonalData } from '../../../../../shared/types/personalTypes';

interface UseMainInfoEditorProps {
  prisonerId: string;
  onSuccess?: () => void;
}

interface ValidationErrors {
  prisoner?: Record<string, string>;
  identity?: Record<string, string>;
  personal?: Record<string, string>;
}

export const useMainInfoEditor = ({ prisonerId, onSuccess }: UseMainInfoEditorProps) => {
  const [isEditingMain, setIsEditingMain] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // ==================== VALIDACIONES ====================
  const validatePrisonerData = useCallback((data: Partial<UpdatePrisonerData>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.registration_number?.trim()) {
      errors.registration_number = 'El número de registro es requerido';
    }

    if (!data.fiscal_file_number?.trim()) {
      errors.fiscal_file_number = 'El número de expediente fiscal es requerido';
    }

    if (!data.status) {
      errors.status = 'El estado es requerido';
    }

    return errors;
  }, []);

  const validateIdentityData = useCallback((data: Partial<UpdateIdentityData>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.first_name?.trim()) {
      errors.first_name = 'El nombre es requerido';
    }

    if (!data.surname?.trim()) {
      errors.surname = 'El apellido es requerido';
    }

    if (!data.birth_place?.trim()) {
      errors.birth_place = 'El lugar de nacimiento es requerido';
    }

    if (!data.residence?.trim()) {
      errors.residence = 'El domicilio es requerido';
    }

    if (!data.citizenship_type) {
      errors.citizenship_type = 'El tipo de ciudadanía es requerido';
    }

    if (!data.country_of_origin?.trim()) {
      errors.country_of_origin = 'El país de origen es requerido';
    }

    if (!data.nationality?.trim()) {
      errors.nationality = 'La nacionalidad es requerida';
    }

    return errors;
  }, []);

  const validatePersonalData = useCallback((data: Partial<UpdatePersonalData>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.marital_status) {
      errors.marital_status = 'El estado civil es requerido';
    }

    if (!data.education_level?.trim()) {
      errors.education_level = 'El nivel de educación es requerido';
    }

    if (!data.gender) {
      errors.gender = 'El género es requerido';
    }

    if (!data.occupation?.trim()) {
      errors.occupation = 'La ocupación es requerida';
    }

    if (!data.father_name?.trim()) {
      errors.father_name = 'El nombre del padre es requerido';
    }

    if (!data.mother_name?.trim()) {
      errors.mother_name = 'El nombre de la madre es requerido';
    }

    if (!data.id_document_type) {
      errors.id_document_type = 'El tipo de documento es requerido';
    }

    if (!data.id_document_number?.trim()) {
      errors.id_document_number = 'El número de documento es requerido';
    }

    if (!data.languages?.trim()) {
      errors.languages = 'Los idiomas son requeridos';
    }

    return errors;
  }, []);

  // ==================== ACTUALIZACIÓN INFORMACIÓN PRINCIPAL ====================
  const updateMainInfo = useCallback(async (
    prisonerData: Partial<UpdatePrisonerData>,
    identityData: Partial<UpdateIdentityData>
  ) => {
    // Validar ambos conjuntos de datos
    const prisonerErrors = validatePrisonerData(prisonerData);
    const identityErrors = validateIdentityData(identityData);

    if (Object.keys(prisonerErrors).length > 0 || Object.keys(identityErrors).length > 0) {
      setErrors({
        prisoner: prisonerErrors,
        identity: identityErrors,
      });
      return false;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Actualizar información del prisionero
      await prisonersService.updatePrisoner(prisonerId, prisonerData as UpdatePrisonerData);

      // Actualizar información de identidad
      await identityService.updateIdentity(prisonerId, identityData);

      notifications.show({
        title: 'Éxito',
        message: 'Información principal actualizada correctamente',
        color: 'green',
      });

      setIsEditingMain(false);
      onSuccess?.();
      return true;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al actualizar información principal',
        color: 'red',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [prisonerId, onSuccess, validatePrisonerData, validateIdentityData]);

  // ==================== ACTUALIZACIÓN INFORMACIÓN PERSONAL ====================
  const updatePersonalInfo = useCallback(async (personalData: Partial<UpdatePersonalData>) => {
    // Validar datos
    const personalErrors = validatePersonalData(personalData);

    if (Object.keys(personalErrors).length > 0) {
      setErrors({
        personal: personalErrors,
      });
      return false;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await personalService.updatePersonal(prisonerId, personalData);

      notifications.show({
        title: 'Éxito',
        message: 'Información personal actualizada correctamente',
        color: 'green',
      });

      setIsEditingPersonal(false);
      onSuccess?.();
      return true;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al actualizar información personal',
        color: 'red',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [prisonerId, onSuccess, validatePersonalData]);

  // ==================== CONTROLES DE EDICIÓN ====================
  const startEditingMain = useCallback(() => {
    setIsEditingMain(true);
    setErrors({});
  }, []);

  const cancelEditingMain = useCallback(() => {
    setIsEditingMain(false);
    setErrors({});
  }, []);

  const startEditingPersonal = useCallback(() => {
    setIsEditingPersonal(true);
    setErrors({});
  }, []);

  const cancelEditingPersonal = useCallback(() => {
    setIsEditingPersonal(false);
    setErrors({});
  }, []);

  return {
    // Estados
    isEditingMain,
    isEditingPersonal,
    isLoading,
    errors,
    
    // Acciones
    updateMainInfo,
    updatePersonalInfo,
    startEditingMain,
    cancelEditingMain,
    startEditingPersonal,
    cancelEditingPersonal,
  };
};
