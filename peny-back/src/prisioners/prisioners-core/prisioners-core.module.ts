import { Module } from '@nestjs/common';
import { PrisionersController } from './prisioners-core.controller';
import { PrisionersService } from './prisioners-core.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [PrisionersController],
  providers: [PrisionersService],
  exports: [PrisionersService],
})
export class PrisionersCoreModule {}
