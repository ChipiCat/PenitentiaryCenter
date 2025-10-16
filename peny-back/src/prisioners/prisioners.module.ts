import { Module } from '@nestjs/common';
import { PrisionersCoreModule } from './prisioners-core/prisioners-core.module';
import { PrisonerIdentityModule } from './prisoner-identity/prisoner-identity.module';

@Module({
  imports: [PrisionersCoreModule, PrisonerIdentityModule],
  exports: [PrisionersCoreModule, PrisonerIdentityModule],
})
export class PrisionersModule {}
