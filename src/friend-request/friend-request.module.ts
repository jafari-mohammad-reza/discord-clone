import { Module } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { FriendRequestGateway } from './friend-request.gateway';

@Module({
  providers: [FriendRequestService, FriendRequestGateway],
  controllers: [],
})
export class FriendRequestModule {}
