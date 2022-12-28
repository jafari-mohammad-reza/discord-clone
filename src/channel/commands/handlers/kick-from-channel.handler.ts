import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { KickFromChannelCommand } from '../impl/kick-from-channel.command';
import { PrismaService } from '../../../core/prisma.service';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(KickFromChannelCommand)
export class KickFromChannelHandler
  implements ICommandHandler<KickFromChannelCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: KickFromChannelCommand): Promise<void> {
    const { userId, channelId } = command;
    const channel = await this.prismaService.channel.findUniqueOrThrow({
      where: { id: channelId },
      include: {
        members: { select: { id: true } },
        roles: true,
        UserOnChannel: true,
      },
    });
    if (!channel.members.find((u) => u.id === userId))
      throw new BadRequestException('this user is not in channel');
    if (channel.ownerId === userId)
      throw new BadRequestException('you can not remove this user');
    await this.prismaService.channel.update({
      where: { id: channel.id },
      data: {
        members: {
          set: channel.members.filter((member) => member.id !== userId),
        },
      },
    });
  }
}
