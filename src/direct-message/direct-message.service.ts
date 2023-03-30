import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { WsException } from '@nestjs/websockets';
import { Chat, Message } from '@prisma/client/generated';

@Injectable()
export class DirectMessageService {
  constructor(private readonly prismaService: PrismaService) {}
  async sendMessage(
    content: string,
    userId: string,
    receiverUsername: string,
  ): Promise<{ chat: Chat; message: Message }> {
    const receiver = await this.prismaService.user.findUnique({
      where: { username: receiverUsername },
      include:{friends:true}
    });

    if (!receiver) throw new Error('There is no user with this username');
    if (!receiver.friends.find(friend => friend.id === userId)) throw new Error('Your are not friend with this user');
    const { id: receiverId } = receiver;

    const existChat = await this.prismaService.chat.findFirst({
      where: {
        users: {
          every: {
            id: { in: [userId, receiverId] },
          },
        },
      },
    });

    const newMessage = await this.prismaService.message.create({
      data: {
        content,
        authorId: userId,
        sentAt: new Date(),
        chatId: existChat ? existChat.id : undefined,
      },
    });

    if (existChat) {
      await this.prismaService.chat.update({
        where: { id: existChat.id },
        data: { messages: { set: { id: newMessage.id } } },
      });
      return { chat: existChat, message: newMessage };
    } else {
      const newChat = await this.prismaService.chat.create({
        data: {
          users: { connect: [{ id: receiverId }, { id: userId }] },
          messages: { connect: { id: newMessage.id } },
        },
      });
      return { chat: newChat, message: newMessage };
    }
  }
  async getMessages(userId: string) {}
}
