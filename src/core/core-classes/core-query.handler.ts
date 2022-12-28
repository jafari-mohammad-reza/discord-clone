import { IQueryHandler } from '@nestjs/cqrs';

export interface CoreQueryHandler extends IQueryHandler {
  readonly entity: string;
}
