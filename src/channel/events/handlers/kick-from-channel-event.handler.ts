import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { KickFromChannelEvent } from '../impl/kick-from-channel.event';
import { PrismaService } from '../../../core/prisma.service';
import { NotifyUserCommand } from '../../commands/impl/notify-user.command';

@EventsHandler(KickFromChannelEvent)
export class KickFromChannelEventHandler
  implements IEventHandler<KickFromChannelEvent>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly commandBus: CommandBus,
  ) {}

  async handle(event: KickFromChannelEvent): Promise<void> {
    try {
      const { userId, channelTitle } = event;
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: { id: userId },
      });
      return this.commandBus.execute(
        new NotifyUserCommand(
          user.email,
          channelTitle,
          `You have been kicked from ${channelTitle}.`,
        ),
      );
    } catch (err) {
      console.error(err);

      return;
    }
  }
}
