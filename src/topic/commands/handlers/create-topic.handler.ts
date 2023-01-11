import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTopicCommand } from '../impl/create-topic.command';
import { PrismaService } from '../../../core/prisma.service';
import { Topic } from '@prisma/client/generated';
import { AlreadyExistException } from '../../../core/exceptions/already-exist.exception';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(CreateTopicCommand)
export class CreateTopicHandler implements ICommandHandler<CreateTopicCommand> {
  constructor(private readonly prismaService: PrismaService) {}
  async execute(command: CreateTopicCommand): Promise<Topic> {
    const {
      dto: { name, channelId },
    } = command;
    if (
      await this.prismaService.topic.findFirst({
        where: { name: name, channelId },
      })
    )
      throw new AlreadyExistException('Topic', 'name');
    if (
      !(await this.prismaService.channel.findUnique({
        where: { id: channelId },
      }))
    )
      throw new NotFoundException();
    return this.prismaService.topic.create({ data: { name, channelId } });
  }
}
