import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RegisterEvent } from '../impl/register.event';
import { MailService } from '../../../mail/mail.service';
import { InternalServerErrorException } from '@nestjs/common';

@EventsHandler(RegisterEvent)
export class RegisterEventHandler implements IEventHandler<RegisterEvent> {
  constructor(private readonly mailService: MailService) {}

  handle(event: RegisterEvent): void {
    try {
      const { verificationCode, email, username } = event;
      this.mailService.sendEmail(
        email,
        'Welcome to Discord-Clone',
        `Dear ${username} Welcome to Discord-Clone;\n  here is your verification code ${verificationCode} \n use it to verify your account`,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
