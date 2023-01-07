import { Module } from "@nestjs/common";
import { ChannelController } from "./channel.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { CoreModule } from "../core/core.module";
import { CreateChannelHandler } from "./commands/handlers/create-channel.handler";
import { ValidOwnerGuard } from "./valid-owner.guard";
import { UpdateChannelHandler } from "./commands/handlers/update-channel.handler";
import { DeleteChannelHandler } from "./commands/handlers/delete-channel.handler";
import { CreateChannelEventHandler } from "./events/handlers/create-channel-event.handler";
import { DeleteChannelEventHandler } from "./events/handlers/delete-channel-event.handler";
import { UpdateChannelEventHandler } from "./events/handlers/update-channel-event.handler";
import { SearchModule } from "../search/search.module";
import { GetChannelQuery } from "./queries/impl/get-channel.query";
import { GetChannelHandler } from "./queries/handlers/get-channel.handler";
import { JoinChannelHandler } from "./commands/handlers/join-channel.handler";
import { NotifyUserHandler } from "./commands/handlers/notify-user.handler";
import { ChannelSaga } from "./channel.saga";
import { LeaveChannelHandler } from "./commands/handlers/leave-channel.handler";
import { KickFromChannelHandler } from "./commands/handlers/kick-from-channel.handler";

const CommandHandlers = [
  CreateChannelHandler,
  UpdateChannelHandler,
  DeleteChannelHandler,
  JoinChannelHandler,
  LeaveChannelHandler,
  KickFromChannelHandler,
  NotifyUserHandler
];
const EventHandlers = [
  CreateChannelEventHandler,
  UpdateChannelEventHandler,
  DeleteChannelEventHandler
];
const QueryHandlers = [GetChannelQuery];

@Module({
  imports: [
    CoreModule,
    CqrsModule,
    SearchModule.registerAsync({
      useFactory: async () => ({
        index: "channel"
      })
    })
  ],
  controllers: [ChannelController],
  providers: [
    ChannelSaga,
    ...CommandHandlers,
    ...EventHandlers,
    GetChannelHandler,
    ValidOwnerGuard
  ]
})
export class ChannelModule {
}
