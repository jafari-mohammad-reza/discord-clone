import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import {Logger, OnModuleDestroy} from '@nestjs/common';
import {Server, Socket} from 'socket.io';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway()
export class CoreGateway implements OnGatewayConnection, OnGatewayDisconnect , OnModuleDestroy {
  @WebSocketServer() protected _server: Server;
  private _logger: Logger;
  protected _prismaService: PrismaService;
  protected _connectedSockets;
  constructor() {
    this._connectedSockets = new Map();
    this._logger = new Logger(CoreGateway.name);
    this._prismaService = new PrismaService();
    this._server = new Server();
  }
  handleConnection(client: Socket) {
    if (!client.handshake.headers.authorization) {
      return client.disconnect();
    }
    this._prismaService
      .getUserFromToken(client.handshake.headers.authorization)
      .then((user) => {
        this._connectedSockets.set(user.username, client.id);
      })
      .catch((err) => {
        this._logger.log(err);
        client.disconnect();
      });
  }

  handleDisconnect(client: Socket) {
    this._prismaService
      .getUserFromToken(client.handshake.headers.authorization)
      .then((user) => {
        if (this._connectedSockets.has(user.username)) {
          this._connectedSockets.delete(user.username);
        }
      })
      .catch((err) => {
        client.disconnect();
      });
  }
  onModuleDestroy(): any {
    this._connectedSockets.clear()
  }
}
