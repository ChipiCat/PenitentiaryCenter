import { Module } from '@nestjs/common';
import { IdentityController } from './prisoner-identity.controller';
import { IdentityService } from './prisoner-identity.service';
import { FilesModule } from '../../files/files.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [IdentityController],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class PrisonerIdentityModule {}
