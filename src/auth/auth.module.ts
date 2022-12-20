import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegisterCommandHandler } from './commands/handlers/register-command.handler';
import { RegisterEventHandler } from './events/handlers/register-event.handler';
import { PrismaService } from '../prisma.service';
import { LoginCommandHandler } from './commands/handlers/login-command.handler';
import { LoginEventHandler } from './events/handlers/login-event.handler';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { VerifyAccountCommandHandler } from './commands/handlers/verify-account-command.handler';
import { SendForgotPasswordCommandHandler } from './commands/handlers/send-forgotPassword-command.handler';
import { ResetPasswordCommandHandler } from './commands/handlers/reset-password-command.handler';
import { SendForgotPasswordEventHandler } from './events/handlers/send-forgotPassword-event.handler';
import { MailService } from '../mail/mail.service';
import { InvalidIpEvent } from './events/impl/invalid-ip.event';
import { ValidateIpCommandHandler } from './commands/handlers/validate-ip-command.handler';
import { InvalidIpEventHandler } from './events/handlers/invalid-ip-event.handler';
import { ConfigModule, ConfigService } from '@nestjs/config';
const CommandHandlers = [
  RegisterCommandHandler,
  LoginCommandHandler,
  VerifyAccountCommandHandler,
  SendForgotPasswordCommandHandler,
  ResetPasswordCommandHandler,
  ValidateIpCommandHandler,
];
const EventHandlers = [
  RegisterEventHandler,
  LoginEventHandler,
  SendForgotPasswordEventHandler,
  InvalidIpEventHandler,
];
@Module({
  imports: [
    CqrsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [...CommandHandlers, ...EventHandlers, PrismaService, MailService],
})
export class AuthModule {}
