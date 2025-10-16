import { Module } from '@nestjs/common';
import { PrisionersController } from '../prisioners.controller';
import { PrisionersService } from './prisioners-core.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PrisionersController],
  providers: [PrisionersService],
  exports: [PrisionersService],
})
export class PrisionersCoreModule {}
