import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetTopicsQuery } from "../impl/get-topics.query";

@QueryHandler(GetTopicsQuery)
export class GetTopicsHandler implements IQueryHandler<GetTopicsQuery> {
  execute(query: GetTopicsQuery): Promise<any> {
    return Promise.resolve(undefined);
  }
}
