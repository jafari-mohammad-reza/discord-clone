import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { DirectMessageService } from './direct-message.service';
import { Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/auth.guard';
import { SendMessageDto } from './dtos/send-message.dto';
import { CoreGateway } from '../core/core.gateway';

@WebSocketGateway()
export class DirectMessageGateway extends CoreGateway implements OnGatewayInit {
  private _DirectMessageGatewayLogger: Logger;

  constructor(private readonly directMessageService: DirectMessageService) {
    super();
    this._DirectMessageGatewayLogger = new Logger(DirectMessageGateway.name);
  }

  afterInit(server: any): any {
    this._DirectMessageGatewayLogger.log('DirectMessageGateway Initialized');
  }
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendDirectMessage')
  async sendMessage(
    @MessageBody() { receiver, content }: SendMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket['user']?.id;
    const { chat, message } = await this.directMessageService.sendMessage(
      content,
      userId,
      receiver,
    );
    this._server
      .to(this._connectedSockets.get(receiver))
      .emit('receivedDirectMessage', {
        message,
        chat,
      });
    this._server.in(chat.id.toString()).emit('newMessage', { message });
  }
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('getMessages')
  async getMessages(@ConnectedSocket() socket: Socket) {
    const userId = socket['user']?.id;
    await this.directMessageService.getMessages(userId);
  }
}
