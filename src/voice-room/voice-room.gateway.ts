import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {CreateVoiceRoomDto} from "./dtos/create-voice-room.dto";
import {Socket} from "socket.io";
import {CoreGateway} from "../core/core.gateway";
import {Logger, UseGuards} from "@nestjs/common";
import {WsValidOwnerGuard} from "../channel/guards/ws-valid-owner.guard";
import {WsValidMemberGuard} from "../channel/guards/ws-valid-member.guard";

@WebSocketGateway()
export class VoiceRoomGateway extends CoreGateway{
  private _VoiceRoomLogger:Logger;
  constructor() {
    super();
    this._VoiceRoomLogger = new Logger(VoiceRoomGateway.name)
  }
  @UseGuards(WsValidOwnerGuard)
  @SubscribeMessage('createVoiceRoom')
  createVoiceRoom(@MessageBody() body:CreateVoiceRoomDto , @ConnectedSocket() client:Socket) {
  }
  @UseGuards(WsValidMemberGuard)
  @SubscribeMessage('joinVoiceRoom')
  joinVoiceRoom(@MessageBody() body:CreateVoiceRoomDto , @ConnectedSocket() client:Socket) {
  }
  @UseGuards(WsValidMemberGuard)
  @SubscribeMessage('leaveVoiceRoom')
  leaveVoiceRoom(@MessageBody() body:CreateVoiceRoomDto , @ConnectedSocket() client:Socket) {
  }
}
