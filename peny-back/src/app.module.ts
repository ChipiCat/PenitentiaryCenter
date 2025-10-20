import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrisionersModule } from './prisioners/prisioners.module';
import { PrisonerCaseModule } from './prisioners/prisoner-case/prisoner-case.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    UserModule,
    PrisionersModule,
    PrisonerCaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
