import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateChannelCommand } from '../impl/update-channel.command';
import { AlreadyExistException } from '../../../core/exceptions/already-exist.exception';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { UpdateChannelEvent } from '../../events/impl/update-channel.event';
import { Channel } from '@prisma/client/generated';

@CommandHandler(UpdateChannelCommand)
export class UpdateChannelHandler
  implements ICommandHandler<UpdateChannelCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateChannelCommand): Promise<Channel> {
    const { title, categoryId, isPublic, file } = command.updateChannelDto;
    const { id } = command;
    if (title) {
      if (
        await this.prismaService.channel.findFirst({
          where: { title: title.trim() },
        })
      )
        throw new AlreadyExistException('Channel', 'Title');
    }
    if (categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) throw new NotFoundException();
    }
    const updatedChannel = await this.prismaService.channel.update({
      where: { id },
      data: { title, categoryId, isPublic: Boolean(isPublic) },
    });
    this.eventBus.publish(new UpdateChannelEvent(updatedChannel, file));
    return updatedChannel;
  }
}
