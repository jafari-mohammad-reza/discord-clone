import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../impl/login.command';
import { publish } from 'rxjs';
import { PrismaService } from '../../../prisma.service';
import { Prisma } from '@prisma/client';
import { compare } from 'bcrypt';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import * as events from 'events';
import { InvalidIpEvent } from '../../events/impl/invalid-ip.event';
import { LoginEvent } from '../../events/impl/login.event';

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus,
  ) {}
  async execute(command: LoginCommand): Promise<string> {
    const { identifier, password, ip } = command;
    const {
      email,
      IsVerified,
      password: userPassword,
      lastLoginIpAddress,
    } = await this.prismaService.user.findFirstOrThrow({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      select: {
        email: true,
        IsVerified: true,
        password: true,
        lastLoginIpAddress: true,
      },
    });
    await this.validateUserInfo(
      email,
      IsVerified,
      password,
      userPassword,
      lastLoginIpAddress,
      ip,
    );
    await this.prismaService.user.update({
      where: { email },
      data: { lastLoginIpAddress: ip },
    });
    this.eventBus.publish(new LoginEvent(email));
    return email;
  }
  private async validateUserInfo(
    email: string,
    IsVerified: boolean,
    password: string,
    userPassword: string,
    lastIp: string,
    ip: string,
  ) {
    if (!IsVerified) {
      throw new BadRequestException('Please verify your account first');
    }
    if (!(await compare(password, userPassword))) {
      throw new BadRequestException(
        'Please insert your credentials correctly.',
      );
    }
    if (lastIp && lastIp !== ip) {
      this.eventBus.publish(new InvalidIpEvent(email, ip));
      throw new ForbiddenException(
        'Please verify your self with the email we sent to you',
      );
    }
  }
}
