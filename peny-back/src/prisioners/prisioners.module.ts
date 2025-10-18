import { Module } from '@nestjs/common';
import { PrisionersCoreModule } from './prisioners-core/prisioners-core.module';
import { PrisonerIdentityModule } from './prisoner-identity/prisoner-identity.module';
import { PrisonerPersonalModule } from './prisoner-personal/prisoner-personal.module';
import { PrisonerPenitentiaryModule } from './prisoner-penitentiary/prisoner-penitentiary.module';
import { PrisonerMedicalRecordModule } from './prisoner-medical-record/prisoner-medical-record.module';

@Module({
  imports: [
    PrisionersCoreModule,
    PrisonerIdentityModule,
    PrisonerPersonalModule,
    PrisonerPenitentiaryModule,
    PrisonerMedicalRecordModule,
  ],
  exports: [
    PrisionersCoreModule,
    PrisonerIdentityModule,
    PrisonerPersonalModule,
    PrisonerPenitentiaryModule,
    PrisonerMedicalRecordModule,
  ],
})
export class PrisionersModule {}
