import { Module } from '@nestjs/common';
import { PrisonerCaseController } from './prisoner-case.controller';
import { PrisonerMandateController } from './prisoner-mandate.controller';
import { PrisonerCaseService } from './prisoner-case.service';
import { PrisonerMandateService } from './prisoner-mandate.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { FilesModule } from '../../files/files.module';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [PrisonerCaseController, PrisonerMandateController],
  providers: [PrisonerCaseService, PrisonerMandateService],
  exports: [PrisonerCaseService, PrisonerMandateService],
})
export class PrisonerCaseModule {}
