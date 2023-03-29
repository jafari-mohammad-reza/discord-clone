import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DirectMessageService } from './direct-message.service';
import { Server, Socket } from 'socket.io';
import {Logger, OnModuleInit, UseGuards} from '@nestjs/common';
import { WsAuthGuard } from '../auth/auth.guard';
import { AcceptFriendRequestDto } from '../friend-request/dtos/accept-friend-request.dto';
import { SendMessageDto } from './dtos/send-message.dto';
import {CoreGateway} from "../core/core.gateway";

@WebSocketGateway()
export class DirectMessageGateway  extends CoreGateway implements OnGatewayInit {
  private _DirectMessageGatewayLogger: Logger;

  constructor(private readonly directMessageService: DirectMessageService) {
    super();
    this._DirectMessageGatewayLogger = new Logger(DirectMessageGateway.name);
  }


  afterInit(server: any): any {
    this._DirectMessageGatewayLogger.log('DirectMessageGateway Initialized');
  }
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() { receiver, content }: SendMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket['user']?.id;
    await this.directMessageService.sendMessage(content, userId, receiver);
  }
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('getMessages')
  async getMessages(@ConnectedSocket() socket: Socket) {
    const userId = socket['user']?.id;
    await this.directMessageService.getMessages(userId);
  }
}
