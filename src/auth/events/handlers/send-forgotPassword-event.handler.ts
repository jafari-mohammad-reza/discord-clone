import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { SendForgotPasswordEvent } from "../impl/send-forgotPassword.event";
import { MailService } from "../../../mail/mail.service";
import { JwtService } from "@nestjs/jwt";
import { InternalServerErrorException } from "@nestjs/common";

@EventsHandler(SendForgotPasswordEvent)
export class SendForgotPasswordEventHandler
  implements IEventHandler<SendForgotPasswordEvent> {
  constructor(
    private readonly mailService: MailService,
    private readonly jwtService: JwtService
  ) {
  }

  async handle(event: SendForgotPasswordEvent): Promise<void> {
    try {
      const { email } = event;
      const token = await this.jwtService.signAsync(
        { email },
        { expiresIn: Date.now() + 900 }
      );
      this.mailService.sendEmail(
        email,
        "Reset your password",
        `Please follow link blow to reset your password hostDomain/${token}`
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
