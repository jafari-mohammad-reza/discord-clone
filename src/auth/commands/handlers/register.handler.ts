import { PrismaService } from '../../../core/prisma.service';
import { RegisterCommand } from '../impl/register.command';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { RegisterEvent } from '../../events/impl/register.event';
import { User } from '../../../core/classTypes/User';
import { common } from 'dropbox';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterCommand): Promise<Object> {
    const { username, email, password } = command;
    const existUser = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existUser) throw new BadRequestException('Invalid username or email.');
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    await this.prismaService.user.create({
      data: { email, username, password, verificationCode: verificationCode },
    });
    this.eventBus.publish(new RegisterEvent(email, username, verificationCode));
    return { username, email, password };
  }
}
