import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InvalidIpEvent } from "../impl/invalid-ip.event";
import { MailService } from "../../../mail/mail.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InternalServerErrorException } from "@nestjs/common";

@EventsHandler(InvalidIpEvent)
export class InvalidIpEventHandler implements IEventHandler<InvalidIpEvent> {
  constructor(
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
  }

  async handle(event: InvalidIpEvent): Promise<void> {
    try {
      const { email, ip } = event;
      const token = await this.jwtService.signAsync(
        { email, ip },
        {
          secret: this.configService.get("JWT_SECRET"),
          expiresIn: Date.now() + 900
        }
      );
      this.mailService.sendEmail(
        email,
        "Invalid Login",
        `There was an invalid login into your account from another device;\n please follow this link ${token} if it was you \n therefore ignore it`
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
