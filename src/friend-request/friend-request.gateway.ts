import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/auth.guard';
import {SendFriendRequestDto} from "./dtos/send-friend-request.dto";
import {AcceptFriendRequestDto} from "./dtos/accept-friend-request.dto";
import {RejectFriendRequestDto} from "./dtos/reject-friend-request.dto";

@WebSocketGateway({ cors: { origin: '*' } })
export class FriendRequestGateway {
  @WebSocketServer()
  server: Server;

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendFriendRequest')
  sendFriendRequest(
    @MessageBody('body') body: SendFriendRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    return 'Hello world!';
  }
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('acceptFriendRequest')
  acceptFriendRequest(
    @MessageBody('body') body:AcceptFriendRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    return 'Hello world!';
  }
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('rejectFriendRequest')
  rejectFriendRequest(
    @MessageBody('body') body:RejectFriendRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    return 'Hello world!';
  }
}
