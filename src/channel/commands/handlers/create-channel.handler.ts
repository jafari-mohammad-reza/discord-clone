import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateChannelCommand } from '../impl/create-channel.command';
import { PrismaService } from '../../../core/prisma.service';
import { AlreadyExistException } from '../../../core/exceptions/already-exist.exception';
import { NotFoundException } from '@nestjs/common';
import { files } from 'dropbox';
import { CreateChannelEvent } from '../../events/impl/create-channel.event';
import { Channel } from '@prisma/client/generated';

@CommandHandler(CreateChannelCommand)
export class CreateChannelHandler
  implements ICommandHandler<CreateChannelCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: CreateChannelCommand): Promise<Channel> {
    const { title, categoryId, file, isPublic } = command.createChannelDto;
    const { ownerId } = command;
    if (
      await this.prismaService.channel.findFirst({
        where: { title: title.trim() },
      })
    )
      throw new AlreadyExistException('Channel', 'Title');
    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException();
    const createdChannel = await this.prismaService.channel.create({
      data: { title, categoryId, ownerId, isPublic: Boolean(isPublic) },
    });
    await this.eventBus.publish(
      new CreateChannelEvent(createdChannel, file),
    );
    return createdChannel;
  }
}
