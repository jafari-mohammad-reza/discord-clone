import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetTopicQuery } from "../impl/get-topic.query";

@QueryHandler(GetTopicQuery)
export class GetTopicHandler implements IQueryHandler<GetTopicQuery> {
  execute(query: GetTopicQuery): Promise<any> {
    return Promise.resolve(undefined);
  }
}
