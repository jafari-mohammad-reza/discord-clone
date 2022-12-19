import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RegisterEvent } from '../impl/register.event';

@EventsHandler(RegisterEvent)
export class RegisterEventHandler implements IEventHandler<RegisterEvent> {
  handle(event: RegisterEvent): void {
    // will send an email to registered user
    const { verificationCode, email } = event;
    console.log(verificationCode, email);
  }
}
