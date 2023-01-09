import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  SEARCH_SERVICE_INDEX,
  SearchModuleConfig,
} from './search.module-defenition';
import {
  DeleteResponse,
  IndicesDeleteResponse,
  IndicesExistsResponse,
  QueryDslQueryContainer,
  SearchRequest,
} from '@elastic/elasticsearch/lib/api/types';
import parseIndexDocument from '../core/utils/parseIndexDocument';

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

  async search(identifier?: string) {
    const query: QueryDslQueryContainer = identifier && {
      multi_match: {
        query: identifier || '',
      },
    };
    const params: SearchRequest = {
      index: this.entityIndex.index,
      query,
      pretty: true,
      request_cache: true,
    };
    return await this.elasticSearchService.search(params, {});
  }

  async addIndex(indexDocument: Object) {
    try {
      indexDocument = parseIndexDocument(indexDocument);
      return await this.elasticSearchService.index({
        index: this.entityIndex.index,
        document: indexDocument,
      });
    } catch (err) {
      return err;
    }
  }

  async updateIndex(id: string, indexDocument: Object) {
    try {
      indexDocument = parseIndexDocument(indexDocument);
      const existIndex = await this.elasticSearchService.search({
        index: this.entityIndex.index,
        query: {
          match: {
            id: id,
          },
        },
      });
      if (!existIndex) throw new NotFoundException();
      return await this.elasticSearchService.update({
        index: this.entityIndex.index,
        id: existIndex.hits.hits[0]._id,
        doc: indexDocument,
      });
    } catch (err) {
      return err;
    }
  }

  async removeIndex(id: string) {
    try {
      return await this.elasticSearchService.deleteByQuery({
        index: this.entityIndex.index,
        query: {
          match: {
            id: id.trim(),
          },
        },
      });
    } catch (err) {
      return err;
    }
  }
  async cleanIndex(index: string) {
    try {
      return await this.elasticSearchService.indices
        .delete({ index })
        .then(async (result: IndicesDeleteResponse) => {
          if (result.acknowledged) {
            return await this.elasticSearchService.indices.create({ index });
          }
        });
    } catch (err) {
      return err;
    }
  }
}
