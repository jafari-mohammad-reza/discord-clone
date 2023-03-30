import {BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException,} from '@nestjs/common';
import {Observable} from 'rxjs';
import {PrismaService} from '../core/prisma.service';
import {Request} from 'express';
import {Channel, User} from '@prisma/client/generated';

@Injectable()
export class ValidOwnerGuard implements CanActivate {
    constructor(private readonly prismaService: PrismaService) {
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const channelId: string =
            request.params['id'] ||
            request.query['channelId']?.toString() ||
            request.body['channelId'];
        const authUser: User = request['user'];
        if (!channelId) throw new BadRequestException('Please insert channel id');
        return this.prismaService.channel
            .findFirst({where: {id: channelId.toString().trim()}})
            .then((result: Channel) => {
                if (!result) throw new NotFoundException('channel not found');
                return result.ownerId === authUser.id;
            })
            .catch((err) => {
                throw err;
            });
    }
}
