import { Module } from '@nestjs/common';
import { PrisonerMedicalRecordController } from './prisoner-medical-record.controller';
import { PrisonerMedicalRecordService } from './prisoner-medical-record.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { FilesModule } from '../../files/files.module';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [PrismaModule, FilesModule, AuditModule],
  controllers: [PrisonerMedicalRecordController],
  providers: [PrisonerMedicalRecordService],
  exports: [PrisonerMedicalRecordService],
})
export class PrisonerMedicalRecordModule {}
