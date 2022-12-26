import { IQueryHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchService } from '../../search/search.service';

export interface CoreQueryHandler extends IQueryHandler {
  readonly entity: string;
}
