import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteChannelCommand } from '../impl/delete-channel.command';
import { PrismaService } from '../../../core/prisma.service';
import { DeleteChannelEvent } from '../../events/impl/delete-channel.event';

@CommandHandler(DeleteChannelCommand)
export class DeleteChannelHandler
  implements ICommandHandler<DeleteChannelCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus,
  ) {}
  async execute(command: DeleteChannelCommand): Promise<void> {
    const { id } = command;
    const channel = await this.prismaService.channel.findFirstOrThrow({
      where: { id },
    });

    await this.prismaService.channel.delete({ where: { id } });
    return this.eventBus.publish(new DeleteChannelEvent(channel));
  }
}
