import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCategoryCommand } from '../impl/delete-category.command';
import { PrismaService } from '../../../core/prisma.service';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler
  implements ICommandHandler<DeleteCategoryCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteCategoryCommand) {
    const { id } = command;
    await this.prismaService.category.findFirstOrThrow({ where: { id } });
    await this.prismaService.category.delete({ where: { id } });
  }
}
