import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UpdateCategoryCommand} from '../impl/update-category.command';
import {NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../../core/prisma.service';
import {AlreadyExistException} from '../../../core/exceptions/already-exist.exception';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler
    implements ICommandHandler<UpdateCategoryCommand> {
    constructor(private readonly prismaService: PrismaService) {
    }

    async execute(command: UpdateCategoryCommand) {
        const {title, id} = command;
        if (!(await this.prismaService.category.findUnique({where: {id}})))
            throw new NotFoundException();
        if (
            await this.prismaService.category.findFirst({
                where: {title: title.trim()},
            })
        )
            throw new AlreadyExistException('category', 'title');
        return this.prismaService.category.update({
            where: {id},
            data: {title},
        });
    }
}
