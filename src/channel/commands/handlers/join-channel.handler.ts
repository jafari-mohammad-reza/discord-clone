import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JoinChannelCommand } from '../impl/join-channel.command';
import { PrismaService } from '../../../core/prisma.service';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(JoinChannelCommand)
export class JoinChannelHandler implements ICommandHandler<JoinChannelCommand> {
  constructor(private readonly prismaService: PrismaService) {}
  async execute(command: JoinChannelCommand): Promise<void> {
    const { id, user } = command;
    const channel = await this.prismaService.channel.findUniqueOrThrow({
      where: { id },
      include: {
        members: { select: { id: true } },
        roles: true,
        UserOnChannel: true,
      },
    });

    if (!channel.isPublic)
      throw new BadRequestException('Channel is not public');
    if (channel.ownerId === user.id)
      throw new BadRequestException('you are owner');
    if (channel.members.find((u) => u.id === user.id))
      throw new BadRequestException('you are already in this channel');
    await this.prismaService.channel.update({
      where: { id: channel.id },
      data: { members: { set: [...channel.members, user] } },
    });
  }
}
