import type { CompletePrisonerProfile } from "../../../../shared/types";
import { MedicalExamCard } from "./cards/MedicalExamCard";
import { LegalCasesCard } from "./cards/LegalCasesCard";
import { ActivityCard } from "./cards/ActivityCard";
import { GeneralBlock } from "./cards/GeneralBlock";

interface ProfileContentProps {
  profile: CompletePrisonerProfile;
}

export const ProfileContent = {
  Medical: ({ profile }: ProfileContentProps) => (
    <MedicalExamCard exam={profile.medical_records?.[0]} />
  ),
  Legal: ({ profile }: ProfileContentProps) => (
    <LegalCasesCard
      cases={profile.cases ?? []}
      mandates={profile.mandates ?? []}
    />
  ),
  Activity: ({ profile }: ProfileContentProps) => (
    <ActivityCard prisonerId={profile.prisoner.id} />
  ),
  GeneralBlock: ({ profile }: ProfileContentProps) => (
    <GeneralBlock profile={profile} />
  ),
};
