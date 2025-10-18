import { Module } from '@nestjs/common';
import { PrisonerContactController } from './prisoner-contact.controller';
import { PrisonerContactService } from './prisoner-contact.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [PrisonerContactController],
	providers: [PrisonerContactService],
	exports: [PrisonerContactService],
})
export class PrisonerContactModule {}
