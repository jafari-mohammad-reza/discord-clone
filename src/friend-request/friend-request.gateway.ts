import {
  ConnectedSocket,
  MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from '../auth/auth.guard';
import { SendFriendRequestDto } from './dtos/send-friend-request.dto';
import { AcceptFriendRequestDto } from './dtos/accept-friend-request.dto';
import { RejectFriendRequestDto } from './dtos/reject-friend-request.dto';
import {
  FriendRequestSearchBy,
  FriendRequestService,
} from './friend-request.service';
import { FriendRequest } from '@prisma/client/generated';
import {Logger, UnauthorizedException, UseGuards} from '@nestjs/common';

  @WebSocketGateway({  serveClient: false ,cors:{origin:"*"}})
export class FriendRequestGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private _server: Server;
  private _connectedSockets;
  constructor(private readonly firstRequestService: FriendRequestService) {
    this._server  = new Server();
    this._connectedSockets = new Map()
  }
    afterInit(server: Server) {
      console.log('FriendRequestGateway Initialized');
    }


    handleConnection(client: Socket) {
    if(!client.handshake.headers.authorization){
      return client.disconnect()
    }
      this.firstRequestService.getUserFromToken(client.handshake.headers.authorization).then((user) => {
        this._connectedSockets.set(user.username , client.id)
      }).catch(err => {
        console.log(err)
        client.disconnect()
      })
    }

    handleDisconnect(client: Socket) {
      this.firstRequestService.getUserFromToken(client.handshake.headers.authorization).then((user) => {
        if(this._connectedSockets.has(user.username)){
          this._connectedSockets.delete(user.username)
        }
      }).catch(err => {
        client.disconnect()
      })

    }
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendFriendRequest')
  async sendFriendRequest(
    @MessageBody() {targetUserName}: SendFriendRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket['user']?.id;
    await this.firstRequestService.sendFriendRequest(userId,targetUserName)
    this._server.to(this._connectedSockets.get(targetUserName)).emit("receiveFriendRequest" , {sender:socket['user']?.username , date:new Date().getDate()})
    return 'Hello world!';
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('acceptFriendRequest')
  acceptFriendRequest(
    @MessageBody('body') body: AcceptFriendRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket['user']?.id;
    return 'Hello world!';
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('rejectFriendRequest')
  rejectFriendRequest(
    @MessageBody('body') body: RejectFriendRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket['user']?.id;
    return 'Hello world!';
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('getReceivedFriendRequest')
  async getReceivedFriendRequest(
    @ConnectedSocket() socket: Socket,
  ): Promise<FriendRequest[]> {
    const userId = socket['user']?.id;
    return this.firstRequestService.getFriendRequests(
      userId,
      FriendRequestSearchBy.RECEIVER,
    );
  }

  @UseGuards(WsAuthGuard)
    @SubscribeMessage('getSentFriendRequest')
  async getSentFriendRequestHandler(
    @ConnectedSocket() socket: Socket,
  ): Promise<FriendRequest[]> {
    const userId = socket['user']?.id;
    return this.firstRequestService.getFriendRequests(
      userId,
      FriendRequestSearchBy.SENDER,
    );
  }
}
