import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { Chat, Message } from '@prisma/client/generated';

@Injectable()
export class DirectMessageService {
  constructor(private readonly prismaService: PrismaService) {}

  async sendMessage(
    content,
    userId,
    receiverUsername,
  ): Promise<{ chat: Chat; message: Message }> {
    const receiver = await this.findReceiver(receiverUsername);
    this.validateFriendship(userId, receiver);

    const existingChat = await this.findExistingChat(userId, receiver.id);
    const newMessage = await this.createMessage(content, userId, existingChat);

    const chat =
      existingChat || (await this.createChat(receiver.id, userId, newMessage));
    return { chat, message: newMessage };
  }

  async getMessages(userId: string) {
    return await this.prismaService.message.findMany({
      where: { author: { id: userId } },
    });
  }
  async getChats(userId: string) {
    return await this.prismaService.chat.findMany({
      where: { users: { some: { id: userId } } },
    });
  }

  private async findReceiver(receiverUsername: string) {
    const receiver = await this.prismaService.user.findUnique({
      where: { username: receiverUsername },
      include: { friends: true },
    });
    if (!receiver) throw new Error('There is no user with this username');
    return receiver;
  }

  private validateFriendship(userId: string, receiver: any) {
    if (!receiver.friends.find((friend) => friend.id === userId))
      throw new Error('You are not friends with this user');
  }

  private async findExistingChat(userId: string, receiverId: string) {
    return this.prismaService.chat.findFirst({
      where: {
        users: {
          every: {
            id: { in: [userId, receiverId] },
          },
        },
      },
    });
  }

  private async createMessage(
    content: string,
    userId: string,
    existingChat: Chat | null,
  ) {
    return this.prismaService.message.create({
      data: {
        content,
        authorId: userId,
        sentAt: new Date(),
        chatId: existingChat ? existingChat.id : undefined,
      },
    });
  }

  private async createChat(
    receiverId: string,
    userId: string,
    newMessage: Message,
  ) {
    return this.prismaService.chat.create({
      data: {
        users: { connect: [{ id: receiverId }, { id: userId }] },
        messages: { connect: { id: newMessage.id } },
      },
    });
  }
}
