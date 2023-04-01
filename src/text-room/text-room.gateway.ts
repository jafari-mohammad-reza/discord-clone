import {ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway,} from '@nestjs/websockets';
import {CoreGateway} from '../core/core.gateway';
import {Logger, UseGuards} from '@nestjs/common';
import {Socket} from 'socket.io';
import {WsValidMemberGuard} from '../channel/guards/ws-valid-member.guard';
import {WsValidOwnerGuard} from '../channel/guards/ws-valid-owner.guard';
import {TextRoomService} from './text-room.service';
import {CreateTextRoomDto} from './dtos/create-text-room.dto';
import {GetTextRoomDto} from './dtos/get-text-room.dto';
import {SendMessageDto} from './dtos/send-message.dto';

@WebSocketGateway()
export class textRoomGateway extends CoreGateway implements OnGatewayInit {
    private readonly _textRoomLogger: Logger;

    constructor(private readonly textRoomService: TextRoomService) {
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
        const {newTextRoom} = await this.textRoomService.createTextRoom(body);
        this._server.to(body.channelId).emit('textRoomAdded', newTextRoom);
    }

    @UseGuards(WsValidMemberGuard)
    @SubscribeMessage('joinTextRoom')
    async joinTextRoom(
        @MessageBody() {textRoomId}: GetTextRoomDto,
        @ConnectedSocket() client: Socket,
    ) {
        const textRoom = await this.textRoomService.getExistTextRoom(textRoomId);
        client.join(textRoom.id);
    }

    @UseGuards(WsValidMemberGuard)
    @SubscribeMessage('leaveTextRoom')
    async leaveTextRoom(
        @MessageBody() {textRoomId}: GetTextRoomDto,
        @ConnectedSocket() client: Socket,
    ) {
        const textRoom = await this.textRoomService.getExistTextRoom(textRoomId);
        client.join(textRoom.id);
    }

    @UseGuards(WsValidMemberGuard)
    @SubscribeMessage('sendTextMessage')
    async sendTextMessage(
        @MessageBody() {textRoomId, content}: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        const userId = client['user']?.id;
        const message = await this.textRoomService.sendTextMessage(
            userId,
            content,
            textRoomId,
        );
        this._server.to(textRoomId).emit('newMessage', message);
    }

    @UseGuards(WsValidOwnerGuard)
    @SubscribeMessage('deleteTextMessage')
    async deleteTextMessage(
        @MessageBody() {messageId},
        @ConnectedSocket() client: Socket,
    ) {
        const {textRoomId, id} = await this.textRoomService.deleteTextMessage(
            messageId,
        );
        this._server.to(textRoomId).emit('messageDeleted', id);
    }
}
