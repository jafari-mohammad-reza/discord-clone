import { EventsHandler, IEvent, IEventHandler } from '@nestjs/cqrs';
import { LoginEvent } from '../impl/login.event';
import { PrismaService } from '../../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';
import { MailService } from '../../../mail/mail.service';

@EventsHandler(LoginEvent)
export class LoginEventHandler implements IEventHandler<LoginEvent> {
  constructor(private readonly mailService: MailService) {}

  async handle(event: LoginEvent): Promise<void> {
    const { email } = event;
    const date = new Date();
    const currentDate =
      date.getFullYear().toString() +
      '-' +
      date.getUTCDay().toString() +
      '-' +
      date.getUTCMonth().toString();
    this.mailService.sendEmail(
      email,
      'Logged in activity',
      `Hello ${
        email.split('@')[0]
      } Some one logged in your account in ${currentDate} \n Please click this link if it was not you ...`,
    );
  }
}
