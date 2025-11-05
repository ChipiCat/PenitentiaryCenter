import React from "react";
import { useNavigate } from "react-router-dom";
import { PrisonerFormWizard } from "../components/forms/PrisonerFormWizard";
import { ROUTES } from "../../../shared/config/routes";
import type { PrisonerBase } from "../../../shared/types/prisonerTypes";
import { PageHeader } from "../../../shared/components/PageHeader";

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
    <div className="w-full flex items-center justify-center">
    <div className="max-w-[1080px] mx-auto flex flex-col w-full gap-5">
      <PageHeader
        title="Nuevo Prisionero"
        subtitle="Rellena el formulario para agregar un nuevo prisionero"
        icon={<></>}
      />

      <PrisonerFormWizard
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
    </div>
  );
};
