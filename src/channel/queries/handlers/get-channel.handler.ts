import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetChannelQuery } from "../impl/get-channel.query";
import { SearchService } from "../../../search/search.service";
import { SearchResponse } from "@elastic/elasticsearch/lib/api/types";

@QueryHandler(GetChannelQuery)
export class GetChannelHandler implements IQueryHandler<GetChannelQuery> {
  constructor(private readonly searchService: SearchService) {
  }

  async execute(query: GetChannelQuery): Promise<SearchResponse> {
    const { identifier } = query;
    return await this.searchService.search(identifier);
  }
}
