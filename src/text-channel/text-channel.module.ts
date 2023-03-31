import { Module } from '@nestjs/common';
import { TextChannelGateway } from './text-channel.gateway';
import { TextChannelService } from './text-channel.service';

@Module({
  providers: [TextChannelGateway, TextChannelService]
})
export class TextChannelModule {}
