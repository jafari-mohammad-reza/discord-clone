import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteTopicCommand } from "../impl/delete-topic.command";
import { PrismaService } from "../../../core/prisma.service";
import { Topic } from "@prisma/client/generated";
import { NotFoundException } from "@nestjs/common";

@CommandHandler(DeleteTopicCommand)
export class DeleteTopicHandler implements ICommandHandler<DeleteTopicCommand> {
  constructor(private readonly prismaService: PrismaService) {
  }

  async execute(command: DeleteTopicCommand): Promise<Topic> {
    const { id } = command;
    if (!(await this.prismaService.topic.findUnique({ where: { id } })))
      throw new NotFoundException();
    return this.prismaService.topic.delete({ where: { id } });
  }
}
