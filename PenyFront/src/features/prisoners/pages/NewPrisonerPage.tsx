import React from "react";
import { useNavigate } from "react-router-dom";
import { PrisonerFormWizard } from "../components/forms/PrisonerFormWizard";
import { ROUTES } from "../../../shared/config/routes";
import type { PrisonerBase } from "../../../shared/types/prisonerTypes";

export const NewPrisonerPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (result: { prisoner: PrisonerBase; id: string }) => {
    console.log("✅ Prisionero creado exitosamente:", result.prisoner);
    if (result.id) {
      navigate(`${ROUTES.PRISONERS}/${result.id}`);
    } else {
      navigate(ROUTES.PRISONERS);
    }
  };

  const handleCancel = () => {
    console.log("❌ Creación de prisionero cancelada");
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
