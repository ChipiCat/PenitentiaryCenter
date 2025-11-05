import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrisionersModule } from './prisioners/prisioners.module';
import { PrisonerCaseModule } from './prisioners/prisoner-case/prisoner-case.module';
import { AuditModule } from './audit/audit.module';
import { AuditMetadataInterceptor } from './common/interceptors/audit-metadata.interceptor';
import { CacheModule as CustomCacheModule } from './common/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CustomCacheModule, // Cache en memoria con node-cache
    PrismaModule,
    AuthModule, // AuthModule debe ir ANTES que AuditModule
    AuditModule,
    UserModule,
    PrisionersModule,
    PrisonerCaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditMetadataInterceptor,
    },
  ],
})
export class AppModule {}
