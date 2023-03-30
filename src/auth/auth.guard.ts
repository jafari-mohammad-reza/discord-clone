import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {from, map, Observable, of} from 'rxjs';
import {Socket} from 'socket.io';
import {WsException} from '@nestjs/websockets';
import {PrismaService} from '../core/prisma.service';
import {JwtService} from '@nestjs/jwt';
import {switchMap} from 'rxjs/operators';

@Injectable()
export class WsAuthGuard implements CanActivate {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {
    }

    canActivate(context: ExecutionContext): Observable<boolean> {
        const client: Socket = context.switchToWs().getClient();

        if (client['user']) {
            return of(true);
        }

        const token = client.handshake.headers.authorization;
        if (!token) {
            return new Observable<boolean>((subscriber) => {
                subscriber.error(new WsException('Please authorize'));
            });
        }

        return from(this.jwtService.verifyAsync(token)).pipe(
            switchMap((result) => {
                const {email} = result;
                if (!email) {
                    throw new WsException('Authorize Again');
                }

                return from(
                    this.prismaService.user.findUnique({
                        where: {email},
                        select: {id: true, username: true},
                    }),
                ).pipe(
                    map((user) => {
                        if (user) {
                            client['user'] = user;
                            return true;
                        } else {
                            throw new WsException('Authorize Again');
                        }
                    }),
                );
            }),
        );
    }
}
