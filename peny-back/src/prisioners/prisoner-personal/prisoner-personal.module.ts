import { Module } from '@nestjs/common';
import { PrisonerPersonalController } from './prisoner-personal.controller';
import { PrisonerPersonalService } from './prisoner-personal.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PrisonerPersonalController],
  providers: [PrisonerPersonalService],
  exports: [PrisonerPersonalService],
})
export class PrisonerPersonalModule {}
