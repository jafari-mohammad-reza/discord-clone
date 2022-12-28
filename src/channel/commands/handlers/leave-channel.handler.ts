import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LeaveChannelCommand } from '../impl/leave-channel.command';
import { PrismaService } from '../../../core/prisma.service';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(LeaveChannelCommand)
export class LeaveChannelHandler
  implements ICommandHandler<LeaveChannelCommand>
{
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: LeaveChannelCommand): Promise<void> {
    const { channelId, user } = command;
    const channel = await this.prismaService.channel.findUniqueOrThrow({
      where: { id: channelId },
      include: {
        members: { select: { id: true } },
        roles: true,
        UserOnChannel: true,
      },
    });
    if (!channel.members.find((u) => u.id === user.id))
      throw new BadRequestException('you are not in this channel');
    if (channel.ownerId === user.id)
      throw new BadRequestException('you are owner you cannot leave');
    await this.prismaService.channel.update({
      where: { id: channel.id },
      data: {
        members: {
          set: channel.members.filter((member) => member.id !== user.id),
        },
      },
    });
  }
}
