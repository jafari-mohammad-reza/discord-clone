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
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/auth.guard';
import { AcceptFriendRequestDto } from '../friend-request/dtos/accept-friend-request.dto';
import { SendMessageDto } from './dtos/send-message.dto';

@WebSocketGateway()
export class DirectMessageGateway implements OnGatewayInit {
  @WebSocketServer() private _server: Server;
  private _logger: Logger;

  constructor(private readonly directMessageService: DirectMessageService) {
    this._server = new Server();
    this._logger = new Logger(DirectMessageGateway.name);
  }
  afterInit(server: any): any {
    this._logger.log('DirectMessageGateway Initialized');
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
