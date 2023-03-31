import { Module } from '@nestjs/common';
import { DirectMessageService } from './direct-message.service';
import { DirectMessageGateway } from './direct-message.gateway';

@Module({
  providers: [DirectMessageService, DirectMessageGateway],
})
export class DirectMessageModule {}
