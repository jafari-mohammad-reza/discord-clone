import { Injectable } from '@nestjs/common';
import {PrismaService} from "../core/prisma.service";

@Injectable()
export class VoiceRoomService {
    constructor(private readonly prismaService:PrismaService) {
    }
    async createVoiceRoom(){}
}
