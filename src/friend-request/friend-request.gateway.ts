import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WsAuthGuard } from '../auth/auth.guard';
import { SendFriendRequestDto } from './dtos/send-friend-request.dto';
import { AcceptFriendRequestDto } from './dtos/accept-friend-request.dto';
import { RejectFriendRequestDto } from './dtos/reject-friend-request.dto';
import {
  FriendRequestSearchBy,
  FriendRequestService,
} from './friend-request.service';
import { FriendRequest } from '@prisma/client/generated';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { CoreGateway } from '../core/core.gateway';
import { WebSocketExceptionsFilter } from '../core/filters/ws-exception.filter';

@WebSocketGateway({ serveClient: false, cors: { origin: '*' } })
export class FriendRequestGateway extends CoreGateway implements OnGatewayInit {
  private _FriendRequestLogger: Logger;

  constructor(private readonly friendRequestService: FriendRequestService) {
    super();
    this._FriendRequestLogger = new Logger(FriendRequestGateway.name);
  }

  afterInit(server: any): any {
    this._FriendRequestLogger.log('FriendRequestGateway Initialized');
  }

  @UseGuards(WsAuthGuard)
  @UseFilters(new WebSocketExceptionsFilter())
  @SubscribeMessage('sendFriendRequest')
  async sendFriendRequest(
    @MessageBody() { targetUserName }: SendFriendRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const userId = socket['user']?.id;
      const { id } = await this.friendRequestService.sendFriendRequest(
        userId,
        targetUserName,
      );
      this._server
        .to(this._connectedSockets.get(targetUserName))
        .emit('receivedFriendRequest', {
          sender: socket['user']?.username,
          requestId: id,
        });
    } catch (err) {
      this._FriendRequestLogger.error(err);
    }
  }

  @UseGuards(WsAuthGuard)
  @UseFilters(new WebSocketExceptionsFilter())
  @SubscribeMessage('acceptFriendRequest')
  async acceptFriendRequest(
    @MessageBody() { requestId }: AcceptFriendRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const userId = socket['user']?.id;
      const { sender, receiver } =
        await this.friendRequestService.acceptFriendRequest(userId, requestId);
      this._server
        .to(this._connectedSockets.get(sender))
        .emit('acceptedFriendRequest', {
          msg: `${receiver} accepted your request`,
        });
    } catch (err) {
      this._FriendRequestLogger.error(err);
    }
  }

  @UseGuards(WsAuthGuard)
  @UseFilters(new WebSocketExceptionsFilter())
  @SubscribeMessage('rejectFriendRequest')
  async rejectFriendRequest(
    @MessageBody() { requestId }: RejectFriendRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const userId = socket['user']?.id;
      await this.friendRequestService.rejectFriendRequest(userId, requestId);
    } catch (err) {
      this._FriendRequestLogger.error(err);
    }
  }

  @UseGuards(WsAuthGuard)
  @UseFilters(new WebSocketExceptionsFilter())
  @SubscribeMessage('getReceivedFriendRequest')
  async getReceivedFriendRequest(
    @ConnectedSocket() socket: Socket,
  ): Promise<FriendRequest[]> {
    try {
      const userId = socket['user']?.id;
      const data = await this.friendRequestService.getFriendRequests(
        userId,
        FriendRequestSearchBy.RECEIVER,
      );
      this._FriendRequestLogger.log(data);
      this._server.to(socket.id).emit('getReceivedFriendRequest', data);
      return data;
    } catch (err) {
      this._FriendRequestLogger.error(err);
    }
  }

  @UseGuards(WsAuthGuard)
  @UseFilters(new WebSocketExceptionsFilter())
  @SubscribeMessage('getSentFriendRequest')
  async getSentFriendRequestHandler(
    @ConnectedSocket() socket: Socket,
  ): Promise<FriendRequest[]> {
    try {
      const userId = socket['user']?.id;
      const data = await this.friendRequestService.getFriendRequests(
        userId,
        FriendRequestSearchBy.SENDER,
      );
      this._server.to(socket.id).emit('getSentFriendRequest', data);
      return data;
    } catch (err) {
      this._FriendRequestLogger.error(err);
    }
  }
}
