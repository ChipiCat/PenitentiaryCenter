import type { CompletePrisonerProfile } from "../../../../shared/types";
import { MedicalExamCard } from "./cards/MedicalExamCard";
import { LegalCasesCard } from "./cards/LegalCasesCard";
import { ActivityCard } from "./cards/ActivityCard";
import { GeneralBlock } from "./cards/GeneralBlock";

interface ProfileContentProps {
  profile: CompletePrisonerProfile;
  onRefresh?: () => void;
}

export const ProfileContent = {
  Medical: ({ profile, onRefresh }: ProfileContentProps) => (
    <MedicalExamCard 
      exams={profile.medical_records} 
      prisonerId={profile.prisoner.id}
      onRefresh={onRefresh}
    />
  ),
  Legal: ({ profile, onRefresh }: ProfileContentProps) => (
    <LegalCasesCard
      cases={profile.cases ?? []}
      prisonerId={profile.prisoner.id}
      onRefresh={onRefresh}
    />
  ),
  Activity: ({ profile }: ProfileContentProps) => (
    <ActivityCard prisonerId={profile.prisoner.id} />
  ),
  GeneralBlock: ({ profile, onRefresh }: ProfileContentProps) => (
    <GeneralBlock profile={profile} onRefresh={onRefresh} />
  ),
};
