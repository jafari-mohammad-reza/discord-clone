import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { LoginCommand } from "../impl/login.command";
import { PrismaService } from "../../../core/prisma.service";
import { compare } from "bcrypt";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { InvalidIpEvent } from "../../events/impl/invalid-ip.event";
import { LoginEvent } from "../../events/impl/login.event";

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus
  ) {
  }

  async execute(command: LoginCommand): Promise<string> {
    const { identifier, password, ip } = command;
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }]
      },
      select: {
        email: true,
        IsVerified: true,
        password: true,
        lastLoginIpAddress: true
      }
    });
    if (!user)
      throw new NotFoundException("Please insert your credentials correctly.");
    const {
      email,
      IsVerified,
      password: userPassword,
      lastLoginIpAddress
    } = user;
    await this.validateUserInfo(
      email,
      IsVerified,
      password,
      userPassword,
      lastLoginIpAddress,
      ip
    );
    await this.prismaService.user.update({
      where: { email },
      data: { lastLoginIpAddress: ip }
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
    ip: string
  ) {
    if (!IsVerified) {
      throw new BadRequestException("Please verify your account first");
    }
    if (!(await compare(password, userPassword))) {
      throw new BadRequestException(
        "Please insert your credentials correctly."
      );
    }
    if (lastIp && lastIp !== ip) {
      this.eventBus.publish(new InvalidIpEvent(email, ip));
      throw new ForbiddenException(
        "Please verify your self with the email we sent to you"
      );
    }
  }
}
