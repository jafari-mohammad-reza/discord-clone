import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UpdateTopicCommand} from '../impl/update-topic.command';
import {Topic} from '@prisma/client/generated';
import {PrismaService} from '../../../core/prisma.service';
import {AlreadyExistException} from '../../../core/exceptions/already-exist.exception';
import {NotFoundException} from '@nestjs/common';

@CommandHandler(UpdateTopicCommand)
export class UpdateTopicHandler implements ICommandHandler<UpdateTopicCommand> {
    constructor(private readonly prismaService: PrismaService) {
    }

    async execute(command: UpdateTopicCommand): Promise<Topic> {
        const {
            dto: {name, channelId},
            id,
        } = command;
        if (
            await this.prismaService.topic.findFirst({
                where: {name: name, channelId},
            })
        )
            throw new AlreadyExistException('Topic', 'name');
        if (
            !(
                (await this.prismaService.channel.findUnique({
                    where: {id: channelId},
                })) || !(await this.prismaService.topic.findUnique({where: {id}}))
            )
        )
            throw new NotFoundException();
        return this.prismaService.topic.update({where: {id}, data: {name}});
    }
}
