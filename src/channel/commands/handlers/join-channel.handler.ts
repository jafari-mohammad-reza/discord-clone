import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JoinChannelCommand } from "../impl/join-channel.command";
import { PrismaService } from "../../../core/prisma.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Channel } from "@prisma/client/generated";

@CommandHandler(JoinChannelCommand)
export class JoinChannelHandler implements ICommandHandler<JoinChannelCommand> {
  constructor(private readonly prismaService: PrismaService) {
  }

  async execute(command: JoinChannelCommand): Promise<Channel> {
    const { id, user } = command;
    const channel = await this.prismaService.channel.findUnique({
      where: { id },
      include: {
        members: { select: { id: true } },
        roles: true,
        UserOnChannel: true
      }
    });
    if (!channel) throw new NotFoundException();
    if (!channel.isPublic)
      throw new BadRequestException("Channel is not public");
    if (channel.ownerId === user.id)
      throw new BadRequestException("you are owner");
    if (channel.members.find((u) => u.id === user.id))
      throw new BadRequestException("you are already in this channel");
    return this.prismaService.channel.update({
      where: { id: channel.id },
      data: {
        members: { set: Array.from(new Set(channel.members).add(user)) }
      }
    });
  }
}
