import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { PrismaService } from '../core/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      try {
        const client: Socket = context.switchToWs().getClient();
        const token = client.handshake.headers.authorization;
        if (!token) {
          throw new WsException('Please authorize');
        }
        fromPromise(this.jwtService.verifyAsync(token))
          .pipe(
            map((result) => {
              const { email } = result;
              if (!email) {
                throw new WsException('Please authorize');
              }
              fromPromise(
                this.prismaService.user.findUnique({
                  where: { email },
                  select: { id: true },
                }),
              )
                .pipe(
                  map((user) => {
                    subscriber.next(!!user);
                    subscriber.complete();
                  }),
                )
                .subscribe();
            }),
          )
          .subscribe();
      } catch (err: any) {
        subscriber.error(new WsException(err));
      }
    });
  }
}
