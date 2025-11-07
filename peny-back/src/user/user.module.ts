import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuditModule } from '../audit/audit.module';
import { MailModule } from '../common/services/mail.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [AuditModule, MailModule, FilesModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
