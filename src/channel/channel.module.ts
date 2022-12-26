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
const CommandHandlers = [
  CreateChannelHandler,
  UpdateChannelHandler,
  DeleteChannelHandler,
];
@Module({
  imports: [CoreModule, CqrsModule],
  controllers: [ChannelController],
  providers: [...CommandHandlers, ValidOwnerGuard],
})
export class ChannelModule {}
