import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteChannelCommand } from '../impl/delete-channel.command';
import { PrismaService } from '../../../core/prisma.service';
import { DeleteChannelEvent } from '../../events/impl/delete-channel.event';
import { Channel } from '@prisma/client/generated';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteChannelCommand)
export class DeleteChannelHandler
  implements ICommandHandler<DeleteChannelCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteChannelCommand): Promise<Channel> {
    const { id } = command;
    const channel = await this.prismaService.channel.findUnique({
      where: { id },
      include: { members: { select: { email: true } } },
    });
    if (!channel) throw new NotFoundException();

    this.eventBus.publish(new DeleteChannelEvent(channel, channel.members));
    return this.prismaService.channel.delete({ where: { id } });
  }
}
