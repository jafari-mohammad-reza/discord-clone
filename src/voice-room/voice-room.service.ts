import {Injectable} from '@nestjs/common';
import {PrismaService} from '../core/prisma.service';
import {CreateVoiceRoomDto} from './dtos/create-voice-room.dto';

@Injectable()
export class VoiceRoomService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async createVoiceRoom({name, topicId, channelId}: CreateVoiceRoomDto) {
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

        const existVoiceRoom = await this.prismaService.voiceRoom.findFirst({
            where: {topicId, name},
        });

        if (existVoiceRoom) {
            throw new Error(
                `Voice room with name } already exists in topic with id ${topicId}.`,
            );
        }

        const newVoiceRoom = await this.prismaService.voiceRoom.create({
            data: {topicId, name},
        });

        return {newVoiceRoom};
    }
}
