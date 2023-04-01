import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CreateCategoryCommand} from '../impl/create-category.command';
import {PrismaService} from '../../../core/prisma.service';
import {InternalServerErrorException} from '@nestjs/common';
import {AlreadyExistException} from '../../../core/exceptions/already-exist.exception';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
    implements ICommandHandler<CreateCategoryCommand> {
    constructor(private readonly prismaService: PrismaService) {
    }

    async execute(command: CreateCategoryCommand) {
        const {title} = command;
        if (
            await this.prismaService.category.findUnique({
                where: {title: title.trim()},
            })
        )
            throw new AlreadyExistException('title', 'category');
        return await this.prismaService.category
            .create({
                data: {title},
            })
            .catch((err) => {
                throw new InternalServerErrorException(err.message);
            });
    }
}
