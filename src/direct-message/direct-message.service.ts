import { Injectable } from '@nestjs/common';

@Injectable()
export class DirectMessageService {
  async sendMessage(content: string, userId: string, receiver: string) {}
  async getMessages(userId: string) {}
}
