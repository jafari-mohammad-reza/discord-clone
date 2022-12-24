import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
  controllers: [ChannelController],
  providers: [],
})
export class ChannelModule {}
