import { Module } from '@nestjs/common';
import { textRoomGateway } from './text-channel.gateway';
import { textRoomService } from './text-channel.service';

@Module({
  providers: [textRoomGateway, textRoomService],
})
export class textRoomModule {}
