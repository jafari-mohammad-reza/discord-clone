import {EventsHandler, IEventHandler} from '@nestjs/cqrs';
import {DeleteCategoryEvent} from '../impl/delete-category.event';
import {PrismaService} from '../../../core/prisma.service';
import {MailService} from '../../../mail/mail.service';
import {InternalServerErrorException} from '@nestjs/common';

@EventsHandler(DeleteCategoryEvent)
export class DeleteCategoryEventHandler
    implements IEventHandler<DeleteCategoryEvent> {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly mailService: MailService,
    ) {
    }

    handle(event: DeleteCategoryEvent): void {
        try {
            const {categoryId} = event;
            this.prismaService.category
                .findFirst({where: {title: 'Global'}})
                .then((result) => {
                    this.prismaService.channel.updateMany({
                        where: {categoryId},
                        data: {
                            categoryId: {set: result.id},
                        },
                    });
                });
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }
}
