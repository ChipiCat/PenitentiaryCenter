import { Module } from '@nestjs/common';
import { PrisonerBelongingController } from './prisoner-belonging.controller';
import { PrisonerBelongingService } from './prisoner-belonging.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { FilesModule } from '../../files/files.module';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [PrismaModule, FilesModule, AuditModule],
  controllers: [PrisonerBelongingController],
  providers: [PrisonerBelongingService],
  exports: [PrisonerBelongingService],
})
export class PrisonerBelongingModule {}
