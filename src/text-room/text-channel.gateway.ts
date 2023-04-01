import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { CoreGateway } from '../core/core.gateway';
import { Logger, UseGuards } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsAuthGuard } from '../auth/auth.guard';
import { WsValidMemberGuard } from '../channel/ws-valid-member.guard';
import { WsValidOwnerGuard } from '../channel/ws-valid-owner.guard';
import { textRoomService } from './text-channel.service';
import { CreateTextRoomDto } from './dtos/create-text-room.dto';
import {GetTextRoomDto} from "./dtos/get-text-room.dto";
@WebSocketGateway()
export class textRoomGateway extends CoreGateway implements OnGatewayInit {
  private readonly _textRoomLogger: Logger;
  constructor(private readonly textRoomService: textRoomService) {
    super();
    this._textRoomLogger = new Logger(textRoomGateway.name);
  }
  afterInit(server: any): any {
    this._textRoomLogger.log('textRoomGateway Initialized');
  }

  @UseGuards(WsValidOwnerGuard)
  @SubscribeMessage('createTextRoom')
  async createTextRoom(
    @MessageBody() body: CreateTextRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { newTextRoom } = await this.textRoomService.createTextRoom(body);
    this._server.to(body.channelId).emit('textRoomAdded', newTextRoom);
  }
  @UseGuards(WsValidMemberGuard)
  @SubscribeMessage('joinTextRoom')
  async joinTextRoom(@MessageBody() {textRoomId}:GetTextRoomDto, @ConnectedSocket() client: Socket) {
    const textRoom = await this.textRoomService.getExistTextRoom(textRoomId)
    client.join(textRoom.id)
  }
  @UseGuards(WsValidMemberGuard)
  @SubscribeMessage('leaveTextRoom')
  async leaveTextRoom(@MessageBody() {textRoomId}:GetTextRoomDto, @ConnectedSocket() client: Socket) {
    const textRoom = await this.textRoomService.getExistTextRoom(textRoomId)
    client.join(textRoom.id)
  }
  @UseGuards(WsValidMemberGuard)
  @SubscribeMessage('sendTextMessage')
  sendTextMessage(@MessageBody() body, @ConnectedSocket() client: Socket) {}
  @UseGuards(WsValidOwnerGuard)
  @SubscribeMessage('deleteTextMessage')
  deleteTextMessage(@MessageBody() body, @ConnectedSocket() client: Socket) {}
}
