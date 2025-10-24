import { Module } from '@nestjs/common';
import { PrisonerChildrenController } from './prisoner-children.controller';
import { PrisonerChildrenService } from './prisoner-children.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [PrisonerChildrenController],
  providers: [PrisonerChildrenService],
  exports: [PrisonerChildrenService],
})
export class PrisonerChildrenModule {}
