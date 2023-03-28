import { Module } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { FriendRequestGateway } from './friend-request.gateway';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [CoreModule],
  providers: [FriendRequestService, FriendRequestGateway],
  controllers: [],
  exports: [FriendRequestService],
})
export class FriendRequestModule {}
