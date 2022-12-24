import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCategoriesQuery } from '../impl/get-categories.query';
import { Category } from '../../../core/classTypes/Category';
import { PrismaService } from '../../../core/prisma.service';
import { BadRequestException } from '@nestjs/common';

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  constructor(private readonly prismaService: PrismaService) {}
  execute(query: GetCategoriesQuery) {
    const { take, page } = query;
    return this.prismaService.category.findMany({
      take,
      skip: (page - 1) * take,
    });
  }
}
