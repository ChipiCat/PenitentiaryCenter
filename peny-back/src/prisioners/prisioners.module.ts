import { Module } from '@nestjs/common';
import { PrisionersCoreModule } from './prisioners-core/prisioners-core.module';
import { PrisonerIdentityModule } from './prisoner-identity/prisoner-identity.module';
import { PrisonerPersonalModule } from './prisoner-personal/prisoner-personal.module';
import { PrisonerPenitentiaryModule } from './prisoner-penitentiary/prisoner-penitentiary.module';

@Module({
  imports: [
    PrisionersCoreModule,
    PrisonerIdentityModule,
    PrisonerPersonalModule,
    PrisonerPenitentiaryModule,
  ],
  exports: [
    PrisionersCoreModule,
    PrisonerIdentityModule,
    PrisonerPersonalModule,
    PrisonerPenitentiaryModule,
  ],
})
export class PrisionersModule {}
