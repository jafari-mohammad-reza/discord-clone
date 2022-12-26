import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreModule } from '../core/core.module';
import { CreateChannelCommand } from './commands/impl/create-channel.command';
import { CreateChannelHandler } from './commands/handlers/create-channel.handler';
import { APP_GUARD } from '@nestjs/core';
import { ValidOwnerGuard } from './valid-owner.guard';
import { UpdateChannelHandler } from './commands/handlers/update-channel.handler';
import { DeleteChannelHandler } from './commands/handlers/delete-channel.handler';
import { CreateChannelEventHandler } from './events/handlers/create-channel-event.handler';
import { DeleteChannelEventHandler } from './events/handlers/delete-channel-event.handler';
import { UpdateChannelEvent } from './events/impl/update-channel.event';
import { UpdateChannelEventHandler } from './events/handlers/update-channel-event.handler';
const CommandHandlers = [
  CreateChannelHandler,
  UpdateChannelHandler,
  DeleteChannelHandler,
];
const EventHandlers = [
  CreateChannelEventHandler,
  UpdateChannelEventHandler,
  DeleteChannelEventHandler,
];
@Module({
  imports: [CoreModule, CqrsModule],
  controllers: [ChannelController],
  providers: [...CommandHandlers, ...EventHandlers, ValidOwnerGuard],
})
export class ChannelModule {}
