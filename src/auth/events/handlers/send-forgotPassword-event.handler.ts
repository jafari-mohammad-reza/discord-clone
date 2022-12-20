import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SendForgotPasswordEvent } from '../impl/send-forgotPassword.event';
import { SendForgotPasswordCommand } from '../../commands/impl/send-forgotPassword.command';
import { MailService } from '../../../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';

@EventsHandler(SendForgotPasswordEvent)
export class SendForgotPasswordEventHandler
  implements IEventHandler<SendForgotPasswordEvent>
{
  constructor(
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}
  async handle(event: SendForgotPasswordEvent): Promise<void> {
    const { email } = event;
    const token = await this.jwtService.signAsync(
      { email },
      { expiresIn: Date.now() + 900 },
    );
    this.mailService.sendEmail(
      email,
      'Reset your password',
      `Please follow link blow to reset your password hostDomain/${token}`,
    );
  }
}
