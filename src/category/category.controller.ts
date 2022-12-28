import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryCommand } from './commands/impl/update-category.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCategoryCommand } from './commands/impl/create-category.command';
import { DeleteCategoryCommand } from './commands/impl/delete-category.command';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { GetCategoriesQuery } from './queries/impl/get-categories.query';
import { GetCategoryQuery } from './queries/impl/get-category.query';

@Controller({
  path: 'categories',
  version: '1',
})
@ApiTags('Category')
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiQuery({ type: String, required: false, name: 'page' })
  @ApiQuery({ type: String, required: false, name: 'take' })
  getCategories(
    @Query('page') page: string = '1',
    @Query('take') take: string = '20',
  ) {
    try {
      if (!parseInt(page) || !parseInt(take))
        throw new BadRequestException('Not valid page or take');
      return this.queryBus.execute(new GetCategoriesQuery(+page, +take));
    } catch (err) {
      return err.message;
    }
  }

  @Get(':id')
  @ApiParam({ type: String, required: true, name: 'id' })
  async getCategory(@Param('id') id: string) {
    try {
      return await this.queryBus.execute(new GetCategoryQuery(id));
    } catch (err) {
      return err.message;
    }
  }

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: CreateCategoryDto, required: true })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      return await this.commandBus.execute(
        new CreateCategoryCommand(createCategoryDto),
      );
    } catch (err) {
      return err.message;
    }
  }

  @Patch(':id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiParam({ type: String, required: true, name: 'id' })
  @ApiBody({ type: UpdateCategoryDto, required: true })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      updateCategoryDto.id = id;
      return await this.commandBus.execute(
        new UpdateCategoryCommand(updateCategoryDto),
      );
    } catch (err) {
      return err.message;
    }
  }

  @Delete(':id')
  @ApiParam({ type: String, required: true, name: 'id' })
  async deleteCategory(@Param('id') id: string) {
    try {
      return await this.commandBus.execute(new DeleteCategoryCommand(id));
    } catch (err) {
      return err.message;
    }
  }
}
