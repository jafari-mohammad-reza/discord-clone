import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCategoryQuery } from "../impl/get-category.query";
import { PrismaService } from "../../../core/prisma.service";
import { NotFoundException } from "@nestjs/common";

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery> {
  constructor(private readonly prismaService: PrismaService) {
  }

  async execute(query: GetCategoryQuery) {
    const { id } = query;
    const category = await this.prismaService.category.findFirst({
      where: { id }
    });
    if (!category) throw new NotFoundException();
    return category;
  }
}
