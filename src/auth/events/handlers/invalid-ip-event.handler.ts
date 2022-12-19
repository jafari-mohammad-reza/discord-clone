import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvalidIpEvent } from '../impl/invalid-ip.event';
import { PrismaService } from '../../../prisma.service';

@EventsHandler(InvalidIpEvent)
export class InvalidIpEventHandler implements IEventHandler<InvalidIpEvent> {
  async handle(event: InvalidIpEvent): Promise<String> {
    const { email, ip } = event;
    return 'jwt';
  }
}
