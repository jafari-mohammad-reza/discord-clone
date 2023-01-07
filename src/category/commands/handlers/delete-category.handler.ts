import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCategoryCommand } from '../impl/delete-category.command';
import { PrismaService } from '../../../core/prisma.service';
import { DeleteCategoryEvent } from '../../events/impl/delete-category.event';
import { Category } from '@prisma/client/generated';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler
  implements ICommandHandler<DeleteCategoryCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteCategoryCommand): Promise<Category> {
    const { id } = command;
    const category = await this.prismaService.category.findFirst({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');
    this.eventBus.publish(new DeleteCategoryEvent(category.id));
    return this.prismaService.category.delete({ where: { id } });
  }
}
