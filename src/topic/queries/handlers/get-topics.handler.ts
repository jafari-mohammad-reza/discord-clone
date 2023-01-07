import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTopicQuery } from '../impl/get-topic.query';
import { GetTopicsQuery } from '../impl/get-topics.query';

@QueryHandler(GetTopicsQuery)
export class GetTopicsHandler implements IQueryHandler<GetTopicsQuery> {
  execute(query: GetTopicsQuery): Promise<any> {
    return Promise.resolve(undefined);
  }
}
