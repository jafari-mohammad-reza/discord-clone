import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class FriendRequestService {
  constructor(private readonly prismaService: PrismaService) {}
  async sendFriendRequest() {}
  async acceptFriendRequest() {}
  async rejectFriendRequest() {}
}
