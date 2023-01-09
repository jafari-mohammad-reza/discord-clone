import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Channel, Topic, User } from '@prisma/client/generated';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class ValidTopicGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const topicId: string = request.params['topicId'];
    if (!topicId || !Number(topicId))
      throw new BadRequestException('Please insert topic id');
    const channelId: string =
      request.body['channelId'] || request.query['channelId'];
    if (!channelId) throw new BadRequestException('Please insert channel id');
    return this.prismaService.topic
      .findFirst({ where: { id: parseInt(topicId) } })
      .then((topic: Topic) => {
        if (!topic) throw new NotFoundException('topic not found');
        return topic.channelId === channelId;
      })
      .catch((err) => {
        throw err;
      });
  }
}
