import { EventsHandler, IEvent, IEventHandler } from '@nestjs/cqrs';
import { LoginEvent } from '../impl/login.event';
import { PrismaService } from '../../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';

@EventsHandler(LoginEvent)
export class LoginEventHandler implements IEventHandler<LoginEvent> {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: LoginEvent): Promise<void> {
    const { email } = event;
    // send email to notify user
  }
}
