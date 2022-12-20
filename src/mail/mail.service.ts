import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendConfirmationLink(email: string, token: string) {
    const url = `${process.env.APPLICATION_ADDRESS}/auth/verify_account/${token}`;
    await this.mailerService.sendMail({
      from: 'discord-clone@gmail.com',
      to: email,
      subject: 'Welcome to Blog app use the link below to verify your account',
      html: `<a style="margin-top: 30px;font-size: 20px;" href=${url}>Click here</a>`,
    });
  }
  async sendEmail(to: string, subject: string, content: any) {
    await this.mailerService.sendMail({
      from: 'discord-clone@gmail.com',
      to,
      subject,
      html: `<body>${content}</body>`,
    });
  }
}
