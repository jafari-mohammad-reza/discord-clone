import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer,} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {UseGuards} from '@nestjs/common';
import {WsAuthGuard} from '../auth/auth.guard';
import {SendFriendRequestDto} from "./dtos/send-friend-request.dto";
import {AcceptFriendRequestDto} from "./dtos/accept-friend-request.dto";
import {RejectFriendRequestDto} from "./dtos/reject-friend-request.dto";
import {FriendRequestSearchBy, FriendRequestService} from "./friend-request.service";
import {FriendRequest} from "@prisma/client/generated";

@WebSocketGateway({ cors: { origin: '*' } })
export class FriendRequestGateway {
  @WebSocketServer()
  server: Server;
constructor(private readonly firstRequestService:FriendRequestService) {
}
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
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('getReceivedFriendRequest')
  async getReceivedFriendRequest(
      @ConnectedSocket() socket: Socket,
  ):Promise<FriendRequest[]> {
    const userId = socket['user'] || await this.firstRequestService.getUserFromToken(socket.handshake.headers.authorization)
    return  this.firstRequestService.getFriendRequests(userId ,FriendRequestSearchBy.RECEIVER)
  }
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('getSentFriendRequest')
  async getSentFriendRequest(
      @ConnectedSocket() socket: Socket,
  ):Promise<FriendRequest[]> {
    const userId = socket['user'] || await this.firstRequestService.getUserFromToken(socket.handshake.headers.authorization)
    return  this.firstRequestService.getFriendRequests(userId,FriendRequestSearchBy.SENDER)
  }
}
