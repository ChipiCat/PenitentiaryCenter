import { Module } from '@nestjs/common';
import { PrisionersCoreModule } from './prisioners-core/prisioners-core.module';
import { PrisonerIdentityModule } from './prisoner-identity/prisoner-identity.module';
import { PrisonerPersonalModule } from './prisoner-personal/prisoner-personal.module';

@Module({
  imports: [
    PrisionersCoreModule,
    PrisonerIdentityModule,
    PrisonerPersonalModule,
  ],
  exports: [
    PrisionersCoreModule,
    PrisonerIdentityModule,
    PrisonerPersonalModule,
  ],
})
export class PrisionersModule {}
