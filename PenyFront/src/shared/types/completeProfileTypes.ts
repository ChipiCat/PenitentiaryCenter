import type { PrisonerBase } from './prisonerTypes';
import type { Identity } from './identityTypes';
import type { Personal } from './personalTypes';
import type { Penitentiary } from './penitentiaryTypes';
import type { MedicalRecord } from './medicalRecordTypes';
import type { Belonging } from './belongingTypes';
import type { Contact } from './contactTypes';
import type { Child } from './childTypes';
import type { Case } from './caseTypes';

export interface CompletePrisonerProfile {
  prisoner: PrisonerBase;
  identity?: Identity;
  personal?: Personal;
  penitentiary?: Penitentiary;
  medical_records: MedicalRecord[];
  belongings: Belonging[];
  contacts: Contact[];
  children: Child[];
  cases: Case[];
}
