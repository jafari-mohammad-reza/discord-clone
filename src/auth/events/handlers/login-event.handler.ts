import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { LoginEvent } from "../impl/login.event";
import { MailService } from "../../../mail/mail.service";
import { InternalServerErrorException } from "@nestjs/common";

@EventsHandler(LoginEvent)
export class LoginEventHandler implements IEventHandler<LoginEvent> {
  constructor(private readonly mailService: MailService) {
  }

  async handle(event: LoginEvent): Promise<void> {
    try {
      const { email } = event;
      const date = new Date();
      const currentDate =
        date.getFullYear().toString() +
        "-" +
        date.getUTCDay().toString() +
        "-" +
        date.getUTCMonth().toString();
      this.mailService.sendEmail(
        email,
        "Logged in activity",
        `Hello ${
          email.split("@")[0]
        } Some one logged in your account in ${currentDate} \n Please click this link if it was not you ...`
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
