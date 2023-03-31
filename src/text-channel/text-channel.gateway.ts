import {ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {CoreGateway} from "../core/core.gateway";
import {Logger, UseGuards} from "@nestjs/common";
import {Socket} from "socket.io";
import {WsAuthGuard} from "../auth/auth.guard";
import {WsValidMemberGuard} from "../channel/ws-valid-member.guard";
import {WsValidOwnerGuard} from "../channel/ws-valid-owner.guard";

@WebSocketGateway()
export class TextChannelGateway extends CoreGateway implements OnGatewayInit{
  private readonly _TextChannelLogger:Logger;
  constructor() {
    super();
    this._TextChannelLogger = new Logger(TextChannelGateway.name)
  }
  afterInit(server: any): any {
    this._TextChannelLogger.log("TextChannelGateway Initialized")
  }


  @UseGuards(WsValidOwnerGuard)
  @SubscribeMessage('createTextChannel')
  createTextChannel(@MessageBody() body , @ConnectedSocket() client:Socket) {
  }
  @UseGuards(WsValidMemberGuard)
  @SubscribeMessage('joinTextChannel')
  joinTextChannel(@MessageBody() body , @ConnectedSocket() client:Socket) {

  }
  @UseGuards(WsValidMemberGuard)

  @SubscribeMessage('leaveTextChannel')
  leaveTextChannel(@MessageBody() body , @ConnectedSocket() client:Socket) {

  }
  @UseGuards(WsValidMemberGuard)

  @SubscribeMessage('sendTextMessage')
  sendTextMessage(@MessageBody() body , @ConnectedSocket() client:Socket) {

  }
  @UseGuards(WsValidOwnerGuard)
  @SubscribeMessage('deleteTextMessage')
  deleteTextMessage(@MessageBody() body , @ConnectedSocket() client:Socket) {

  }
}
