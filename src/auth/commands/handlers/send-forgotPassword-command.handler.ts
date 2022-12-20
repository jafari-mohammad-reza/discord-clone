import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SendForgotPasswordCommand } from '../impl/send-forgotPassword.command';
import { PrismaService } from '../../../prisma.service';
import { BadRequestException, MethodNotAllowedException } from '@nestjs/common';
import { SendForgotPasswordEvent } from '../../events/impl/send-forgotPassword.event';

@CommandHandler(SendForgotPasswordCommand)
export class SendForgotPasswordCommandHandler
  implements ICommandHandler<SendForgotPasswordCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SendForgotPasswordCommand): Promise<void> {
    const { email } = command;
    const { resetPasswordAttempt, lastResetPasswordAttempt } =
      await this.prismaService.user.findUniqueOrThrow({
        where: { email },
        select: {
          resetPasswordAttempt: true,
          lastResetPasswordAttempt: true,
        },
      });
    const currentDate = new Date();
    if (
      resetPasswordAttempt >= 3 ||
      Number(lastResetPasswordAttempt) >
        currentDate.setDate(currentDate.getDate() - 30)
    ) {
      throw new MethodNotAllowedException(
        'You are not allowed to change your password',
      );
    }
    this.eventBus.publish(new SendForgotPasswordEvent(email));
  }
}
