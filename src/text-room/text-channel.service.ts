import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateTextRoomDto } from './dtos/create-text-room.dto';
import { WsException } from '@nestjs/websockets';
import { Channel, TextRoom } from '@prisma/client/generated';

@Injectable()
export class textRoomService {
  constructor(private readonly prismaService: PrismaService) {}
  async createTextRoom({
    textRoomName,
    channelId,
    topicId,
  }: CreateTextRoomDto): Promise<{ newTextRoom: TextRoom }> {
    const channel = await this.prismaService.channel.findUnique({
      where: { id: channelId },
      include: { Topics: true },
    });
    if (!channel) {
      throw new WsException(`Channel with id ${channelId} not found.`);
    }

    const topic = channel.Topics.find((t) => t.id === topicId);
    if (!topic) {
      throw new WsException(
        `Topic with id ${topicId} not found in channel with id ${channelId}.`,
      );
    }

    const existTextRoom = await this.prismaService.textRoom.findFirst({
      where: { topicId: topicId, name: textRoomName },
    });
    if (existTextRoom) {
      throw new WsException(
        `Text room with name ${textRoomName} already exists in topic with id ${topicId}.`,
      );
    }

    const newTextRoom = await this.prismaService.textRoom.create({
      data: { topicId: topicId, name: textRoomName },
    });

    return { newTextRoom };
  }
  async getExistTextRoom(textRoomId:string){
      return await this.prismaService.textRoom.findUniqueOrThrow({
          where: { id: textRoomId},
      });
  }
  async sendTextMessage() {}
  async deleteTextMessage() {}
}
