import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {NotifyUserCommand} from '../impl/notify-user.command';
import {PrismaService} from '../../../core/prisma.service';
import {MailService} from '../../../mail/mail.service';

@CommandHandler(NotifyUserCommand)
export class NotifyUserHandler implements ICommandHandler<NotifyUserCommand> {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly mailService: MailService,
    ) {
    }

    async execute(command: NotifyUserCommand): Promise<void> {
        const {message, members, channelTitle} = command;

        if (Array.isArray(members)) {
            members.map((member) =>
                this.mailService.sendEmail(
                    member.email,
                    `Message from ${channelTitle}`,
                    message,
                ),
            );
        } else {
            this.mailService.sendEmail(
                members,
                `Message from ${channelTitle}`,
                message,
            );
        }
    }
}
