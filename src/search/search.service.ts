import { Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import {
  SEARCH_SERVICE_INDEX,
  SearchModuleConfig,
} from './search.module-defenition';
import {
  IndexResponse,
  IndicesExistsResponse,
  IndicesGetResponse,
} from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class SearchService {
  private indic;
  constructor(
    private readonly elasticSearchService: ElasticsearchService,
    @Inject(SEARCH_SERVICE_INDEX)
    private readonly entityIndex: SearchModuleConfig,
  ) {
    const { index } = entityIndex;
    this.elasticSearchService.indices
      .exists({ index })
      .then((result: IndicesExistsResponse) => {
        if (!result) {
          this.elasticSearchService.indices.create({
            index,
          });
        }
      });
  }
  async search(identifier: string) {
    return await this.elasticSearchService.search({
      index: this.entityIndex.index,
      query: {
        multi_match: {
          query: identifier,
        },
      },
    });
  }
}
