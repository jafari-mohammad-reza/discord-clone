import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterHandler } from './commands/handlers/register.handler';
import { RegisterEventHandler } from './events/handlers/register-event.handler';
import { LoginHandler } from './commands/handlers/login.handler';
import { LoginEventHandler } from './events/handlers/login-event.handler';
import { VerifyAccountHandler } from './commands/handlers/verify-account.handler';
import { SendForgotPasswordHandler } from './commands/handlers/send-forgotPassword.handler';
import { ResetPasswordHandler } from './commands/handlers/reset-password.handler';
import { SendForgotPasswordEventHandler } from './events/handlers/send-forgotPassword-event.handler';
import { MailService } from '../mail/mail.service';
import { ValidateIpHandler } from './commands/handlers/validate-ip.handler';
import { InvalidIpEventHandler } from './events/handlers/invalid-ip-event.handler';
import { CoreModule } from '../core/core.module';
import { AuthController } from './auth.controller';

const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
  VerifyAccountHandler,
  SendForgotPasswordHandler,
  ResetPasswordHandler,
  ValidateIpHandler,
];
const EventHandlers = [
  RegisterEventHandler,
  LoginEventHandler,
  SendForgotPasswordEventHandler,
  InvalidIpEventHandler,
];

@Module({
  imports: [CoreModule, CqrsModule],
  controllers: [AuthController],
  providers: [...CommandHandlers, ...EventHandlers, MailService],
})
export class AuthModule {}
