import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway,} from '@nestjs/websockets';
import {CreateVoiceRoomDto} from './dtos/create-voice-room.dto';
import {Socket} from 'socket.io';
import {CoreGateway} from '../core/core.gateway';
import {Logger, UseFilters, UseGuards} from '@nestjs/common';
import {WsValidOwnerGuard} from '../channel/guards/ws-valid-owner.guard';
import {WsValidMemberGuard} from '../channel/guards/ws-valid-member.guard';
import {VoiceRoomService} from './voice-room.service';
import {GetVoiceRoomDto} from './dtos/get-voice-room.dto';
import {WebSocketExceptionsFilter} from '../core/filters/ws-exception.filter';

@WebSocketGateway()
export class VoiceRoomGateway extends CoreGateway {
    private _VoiceRoomLogger: Logger;
    private readonly peerConnections: Map<string, RTCPeerConnection>;

    constructor(private readonly voiceRoomService: VoiceRoomService) {
        super();
        this._VoiceRoomLogger = new Logger(VoiceRoomGateway.name);
        this.peerConnections = new Map<string, RTCPeerConnection>();
    }

    @UseGuards(WsValidOwnerGuard)
    @UseFilters(new WebSocketExceptionsFilter())
    @SubscribeMessage('createVoiceRoom')
    async createVoiceRoom(
        @MessageBody() body: CreateVoiceRoomDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const {newVoiceRoom} = await this.voiceRoomService.createVoiceRoom(
                body,
            );
            this._server.to(body.channelId).emit('voiceRoomCreated', newVoiceRoom);
        } catch (err) {
            this._VoiceRoomLogger.error(err);
        }
    }

    @UseGuards(WsValidMemberGuard)
    @UseFilters(new WebSocketExceptionsFilter())
    @SubscribeMessage('joinVoiceRoom')
    joinVoiceRoom(
        @MessageBody() {voiceRoomId}: GetVoiceRoomDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            client.join(voiceRoomId);
            client.to(voiceRoomId).emit('userJoin', client.id);

            const peerConnection = new RTCPeerConnection();
            this.peerConnections.set(client.id, peerConnection);

            peerConnection.onnegotiationneeded = () => {
                peerConnection
                    .createOffer()
                    .then((offer) => peerConnection.setLocalDescription(offer))
                    .then(() => client.emit('offer', peerConnection.localDescription))
                    .catch((error) => console.error(error));
            };

            peerConnection.onicecandidate = ({candidate}) => {
                candidate && client.emit('iceCandidate', candidate);
            };

            peerConnection.ondatachannel = ({channel}) => {
                channel.binaryType = 'arraybuffer';
                channel.onmessage = ({data}) => {
                    client.broadcast.to(voiceRoomId).emit('voiceData', data);
                };
            };
        } catch (err) {
            this._VoiceRoomLogger.error(err);
        }
    }

    @UseGuards(WsValidMemberGuard)
    @UseFilters(new WebSocketExceptionsFilter())
    @SubscribeMessage('leaveVoiceRoom')
    leaveVoiceRoom(
        @MessageBody() {voiceRoomId}: GetVoiceRoomDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            client.leave(voiceRoomId);
            const pc = this.peerConnections.get(client.id);
            if (pc) {
                pc.close();
                this.peerConnections.delete(client.id);
            }
            client.to(voiceRoomId).emit('userLeft', client.id);
        } catch (err) {
            this._VoiceRoomLogger.error(err);
        }
    }
}
