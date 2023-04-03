import { Module } from '@nestjs/common';
import { VoiceRoomService } from './voice-room.service';
import { VoiceRoomGateway } from './voice-room.gateway';

@Module({
  providers: [VoiceRoomService, VoiceRoomGateway]
})
export class VoiceRoomModule {}
