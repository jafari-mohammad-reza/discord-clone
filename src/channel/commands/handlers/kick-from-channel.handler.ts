import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { KickFromChannelCommand } from "../impl/kick-from-channel.command";
import { PrismaService } from "../../../core/prisma.service";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Channel } from "@prisma/client/generated";
import { KickFromChannelEvent } from "../../events/impl/kick-from-channel.event";

@CommandHandler(KickFromChannelCommand)
export class KickFromChannelHandler
  implements ICommandHandler<KickFromChannelCommand> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus
  ) {
  }

  async execute(command: KickFromChannelCommand): Promise<Channel> {
    const { userId, channelId } = command;
    const channel = await this.prismaService.channel.findUnique({
      where: { id: channelId },
      select: {
        title: true,
        members: { select: { id: true } },
        roles: true,
        UserOnChannel: true,
        ownerId: true,
        id: true
      }
    });
    if (!channel) throw new NotFoundException();
    if (!channel.members.find((u) => u.id === userId))
      throw new BadRequestException("this user is not in channel");
    if (channel.ownerId === userId)
      throw new ForbiddenException("you can not remove this user");
    const newMembers = new Set(channel.members);
    newMembers.forEach((u) => (u.id === userId ? newMembers.delete(u) : u));
    this.eventBus.publish(new KickFromChannelEvent(userId, channel.title));
    return this.prismaService.channel.update({
      where: { id: channel.id },
      data: {
        members: {
          set: Array.from(newMembers)
        }
      }
    });
  }
}
