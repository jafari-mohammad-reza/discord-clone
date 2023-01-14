import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetTopicsQuery } from "../impl/get-topics.query";
import { Topic } from "@prisma/client/generated";
import { PrismaService } from "../../../core/prisma.service";

@QueryHandler(GetTopicsQuery)
export class GetTopicsHandler implements IQueryHandler<GetTopicsQuery> {
  constructor(private readonly prismaService: PrismaService) {
  }

  async execute(query: GetTopicsQuery): Promise<Topic[]> {
    return this.prismaService.topic.findMany({
      where: { channelId: query.channelId }
    });
  }
}
