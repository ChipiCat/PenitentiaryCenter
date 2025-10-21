import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PrisonerFormWizard } from '../components/forms/PrisonerFormWizard';
import { ROUTES } from '../../../shared/config/routes';

export const NewPrisonerPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (prisoner: any) => {
    console.log('✅ Prisionero creado exitosamente:', prisoner);
    // Redirigir al perfil del nuevo prisionero
    if (prisoner.id) {
      navigate(`${ROUTES.PRISONERS}/${prisoner.id}`);
    } else {
      // Si no tenemos ID, volver a la lista
      navigate(ROUTES.PRISONERS);
    }
  };

  const handleCancel = () => {
    console.log('❌ Creación de prisionero cancelada');
    // Volver a la lista de prisioneros
    navigate(ROUTES.PRISONERS);
  };

  return (
    <PrisonerFormWizard
      mode="create"
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};