import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../impl/reset-password.command';
import { PrismaService } from '../../../core/prisma.service';
import { compare } from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    try {
      const { email, password } = command;
      const user = await this.prismaService.user.findUnique({
        where: { email },
        select: {
          password: true,
        },
      });
      if (!user) throw new NotFoundException('user not found');
      if (await compare(password, user.password)) {
        throw new BadRequestException(
          'New password must be different from previous one',
        );
      }
      await this.prismaService.user.update({
        where: { email },
        data: {
          password,
          resetPasswordAttempt: { increment: 1 },
          lastResetPasswordAttempt: new Date(),
        },
      });
    } catch (err) {
      return err.message;
    }
  }
}
