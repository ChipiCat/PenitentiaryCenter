import { Module } from '@nestjs/common';
import { PrisonerPenitentiaryController } from './prisoner-penitentiary.controller';
import { PrisonerPenitentiaryService } from './prisoner-penitentiary.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [PrisonerPenitentiaryController],
  providers: [PrisonerPenitentiaryService],
  exports: [PrisonerPenitentiaryService],
})
export class PrisonerPenitentiaryModule {}
