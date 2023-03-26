import {Injectable, InternalServerErrorException} from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {
  }

  async sendEmail(to: string, subject: string, content: any) {
    try{
      await this.mailerService.sendMail({
        from: "discord-clone@gmail.com",
        to,
        subject,
        html: `<body>${content}</body>`
      });
    }catch (err){
      console.log(err)
    }
  }
}
