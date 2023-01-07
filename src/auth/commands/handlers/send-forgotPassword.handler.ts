import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { SendForgotPasswordCommand } from "../impl/send-forgotPassword.command";
import { PrismaService } from "../../../core/prisma.service";
import { MethodNotAllowedException, NotFoundException } from "@nestjs/common";
import { SendForgotPasswordEvent } from "../../events/impl/send-forgotPassword.event";

@CommandHandler(SendForgotPasswordCommand)
export class SendForgotPasswordHandler
  implements ICommandHandler<SendForgotPasswordCommand> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus
  ) {
  }

  async execute(command: SendForgotPasswordCommand): Promise<void> {
    const { email } = command;
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        resetPasswordAttempt: true,
        lastResetPasswordAttempt: true
      }
    });
    if (!user) throw new NotFoundException("user not found");
    const { resetPasswordAttempt, lastResetPasswordAttempt } = user;
    const currentDate = new Date();
    if (
      resetPasswordAttempt >= 3 ||
      Number(lastResetPasswordAttempt) >
      currentDate.setDate(currentDate.getDate() - 30)
    ) {
      throw new MethodNotAllowedException(
        "You are not allowed to change your password"
      );
    }
    this.eventBus.publish(new SendForgotPasswordEvent(email));
  }
}
