import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../core/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateCategoryHandler } from './commands/handlers/create-category.handler';
import { UpdateCategoryHandler } from './commands/handlers/update-Category.handler';
import { DeleteCategoryHandler } from './commands/handlers/delete-category.handler';
import { DeleteCategoryEventHandler } from './events/handlers/delete-category-event.handler';
import { GetCategoriesHandler } from './queries/handlers/get-categories.handler';
import { GetCategoryHandler } from './queries/handlers/get-category.handler';

const CommandHandlers = [
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
];
const QueryHandlers = [GetCategoriesHandler, GetCategoryHandler];

@Module({
  imports: [CqrsModule],
  controllers: [CategoryController],
  providers: [...CommandHandlers, ...QueryHandlers, DeleteCategoryEventHandler],
})
export class CategoryModule {}
