import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ValidateIpCommand } from '../impl/validate-ip.command';
import { PrismaService } from '../../../prisma.service';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(ValidateIpCommand)
export class ValidateIpCommandHandler
  implements ICommandHandler<ValidateIpCommand>
{
  constructor(private readonly prismaService: PrismaService) {}
  async execute(command: ValidateIpCommand): Promise<void> {
    const { email } = command;
    this.prismaService.user
      .update({ where: { email }, data: { lastLoginIpAddress: null } })
      .catch((err) => {
        throw new BadRequestException(err.message);
      });
  }
}
