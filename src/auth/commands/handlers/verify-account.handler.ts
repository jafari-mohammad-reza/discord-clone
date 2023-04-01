import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyAccountCommand } from '../impl/verify-account.command';
import { PrismaService } from '../../../core/prisma.service';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(VerifyAccountCommand)
export class VerifyAccountHandler
  implements ICommandHandler<VerifyAccountCommand>
{
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: VerifyAccountCommand): Promise<void> {
    const { code } = command;
    const user = await this.prismaService.user.findFirst({
      where: { verificationCode: code },
    });
    if (!user) throw new NotFoundException('There is no user with this code');
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { IsVerified: true, verificationCode: null },
    });
  }
}
