import {Injectable} from '@nestjs/common';

import {CreateTextRoomDto} from './dtos/create-text-room.dto';
import {PrismaService} from "../core/prisma.service";
import {TextRoom} from "@prisma/client/generated";


@Injectable()
export class TextRoomService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async createTextRoom({
                             textRoomName,
                             channelId,
                             topicId,
                         }: CreateTextRoomDto): Promise<{ newTextRoom: TextRoom }> {
        const channel = await this.prismaService.channel.findUnique({
            where: {id: channelId},
            include: {Topics: {where: {id: topicId}, select: {id: true}}},
        });

        if (!channel) {
            throw new Error(`Channel with id ${channelId} not found.`);
        }

        if (!channel.Topics.length) {
            throw new Error(
                `Topic with id ${topicId} not found in channel with id ${channelId}.`,
            );
        }

        const existTextRoom = await this.prismaService.textRoom.findFirst({
            where: {topicId, name: textRoomName},
        });

        if (existTextRoom) {
            throw new Error(
                `Text room with name ${textRoomName} already exists in topic with id ${topicId}.`,
            );
        }

        const newTextRoom = await this.prismaService.textRoom.create({
            data: {topicId, name: textRoomName},
        });

        return {newTextRoom};
    }

    async getExistTextRoom(textRoomId: string): Promise<TextRoom> {
        return await this.prismaService.textRoom.findUnique({where: {id: textRoomId}});
    }

    async sendTextMessage(userId: string, content: string, textRoomId: string) {
        const textRoom = await this.prismaService.textRoom.findUnique({
            where: {id: textRoomId},
            include: {messages: true},
        });

        if (!textRoom) {
            throw new Error('Text room not found');
        }

        return await this.prismaService.message.create({
            data: {textRoomId, content, authorId: userId},
        });
    }

    async deleteTextMessage(messageId: number) {
        const message = await this.prismaService.message.delete({
            where: {id: messageId},
            select: {textRoomId: true, id: true},
        });

        if (!message) {
            throw new Error(`Message with id ${messageId} not found.`);
        }

        return message;
    }
}
