import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
export enum FriendRequestSearchBy {
  SENDER = 'sender',
  RECEIVER = 'receiver',
}
@Injectable()
export class FriendRequestService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async getFriendRequests(userId: string, searchBy: FriendRequestSearchBy) {
    const where =
      searchBy === FriendRequestSearchBy.SENDER
        ? { sender: { id: userId } }
        : { receiver: { id: userId } };
    return this.prismaService.friendRequest.findMany({ where :{sender:{id:userId}} });
  }

  async acceptFriendRequest(requestId: number) {
    const request = await this.prismaService.friendRequest.findFirst({
      where: { id: requestId },
    });
    if (!request)
      throw new WsException(`Friend request ${requestId} not found`);
    try {
      await Promise.all([
        this.prismaService.user.update({
          where: { id: request.senderId },
          data: { friends: { connect: [{ id: request.receiverId }] } },
        }),
        this.prismaService.user.update({
          where: { id: request.receiverId },
          data: { friends: { connect: [{ id: request.senderId }] } },
        }),
        this.prismaService.friendRequest.delete({ where: { id: requestId } }),
      ]);
    } catch (e) {
      throw new WsException(`Error accepting friend request: ${e.message}`);
    }
  }

  async rejectFriendRequest(requestId: number) {
    try {
      await this.prismaService.friendRequest.delete({
        where: { id: requestId },
      });
    } catch (e) {
      throw new WsException(`Error rejecting friend request: ${e.message}`);
    }
  }

  async getUserFromToken(token: string) {
    try {
      const { email } = await this.jwtService.verifyAsync(token);
      if (!email) throw new UnauthorizedException('Invalid token');
      const user = await this.prismaService.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (!user) throw new UnauthorizedException('User not found');
      return user;
    } catch (e) {
      throw new UnauthorizedException(
        `Error getting user from token: ${e.message}`,
      );
    }
  }

  async sendFriendRequest(userId: string, targetUserName: string) {
    const receiver = await this.prismaService.user.findFirst({
      where: { username: targetUserName },
    });
    if (!receiver)
      throw new WsException(`Receiver ${targetUserName} not found`);
    try {
      await this.prismaService.friendRequest.create({
        data: { senderId: userId, receiverId: receiver.id },
      });
    } catch (e) {
      throw new WsException(`Error sending friend request: ${e.message}`);
    }
  }
}
