import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SendForgotPasswordEvent } from '../impl/send-forgotPassword.event';
import { SendForgotPasswordCommand } from '../../commands/impl/send-forgotPassword.command';

@EventsHandler(SendForgotPasswordEvent)
export class SendForgotPasswordEventHandler
  implements IEventHandler<SendForgotPasswordEvent>
{
  handle(event: SendForgotPasswordEvent): any {
    // send reset password link
  }
}
