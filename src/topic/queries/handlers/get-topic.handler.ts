import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetTopicQuery } from "../impl/get-topic.query";
import { Topic } from "@prisma/client/generated";
import { PrismaService } from "../../../core/prisma.service";
import { NotFoundException } from "@nestjs/common";

@QueryHandler(GetTopicQuery)
export class GetTopicHandler implements IQueryHandler<GetTopicQuery> {
  constructor(private readonly prismaService: PrismaService) {
  }

  async execute(query: GetTopicQuery): Promise<Topic> {
    const { id, channelId } = query;
    const topic = await this.prismaService.topic.findFirst({
      where: { channelId, id }
    });
    if (!topic) throw new NotFoundException();
    return topic;
  }
}
