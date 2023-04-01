import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {PrismaService} from '../../core/prisma.service';
import {from, map, Observable, of} from 'rxjs';
import {Socket} from 'socket.io';
import {WsException} from '@nestjs/websockets';
import {switchMap} from 'rxjs/operators';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class WsValidMemberGuard implements CanActivate {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {
    }

    canActivate(context: ExecutionContext): Observable<boolean> {
        const client: Socket = context.switchToWs().getClient();

        const {authorization: token, channelid: channelId} =
            client.handshake.headers;
        if (!token || !channelId) {
            throw new WsException('Please insert token and channelId');
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
                    switchMap((user) => {
                        if (!user) {
                            return of(false);
                        }
                        client['user'] = user;

                        return from(
                            this.prismaService.channel.findFirst({
                                where: {id: channelId.toString()},
                                include: {members: true},
                            }),
                        ).pipe(
                            map((channel) => {
                                if (!channel) {
                                    throw new WsException('Channel Not Exist');
                                }
                                return (
                                    !!channel.members.find((member) => member.id === user.id) ||
                                    channel.ownerId === user.id
                                );
                            }),
                        );
                    }),
                );
            }),
        );
    }
}
