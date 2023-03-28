import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import {Prisma} from "@prisma/client/generated";
import {from} from "rxjs";
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
    return this.prismaService.friendRequest.findMany({
      where,
    });
  }

  async acceptFriendRequest(userId:string,requestId: number) {
    const request = await this.prismaService.friendRequest.findFirst({
      where: { id: requestId },
      include :{sender : {select:{username:true}},receiver :{select:{username:true}}}
    });
    if (!request)
      throw new WsException(`Friend request ${requestId} not found`);
    if(request.receiverId !== userId) {
      throw new WsException(`your not allowed to accept this request`);
    }
    try {
      await Promise.all([
        this.prismaService.user.update({
          where: { id: request.senderId },
          data: { friends :{set : {id:request.receiverId} }},
        }),
        this.prismaService.user.update({
          where: { id: request.receiverId },
          data: { friends :{set : {id:request.senderId}}},
        }),
        this.prismaService.friendRequest.delete({ where: { id: requestId } }),
      ]);
      return {sender:request.sender.username , receiver:request.receiver.username}
    } catch (e) {
      console.log(e)
      throw new WsException(`Error accepting friend request: ${e.message}`);
    }
  }

  async rejectFriendRequest(userId:string,requestId: number) {
    try {
      if((await this.prismaService.friendRequest.findFirst({where:{id:requestId}})).receiverId !== userId){
        throw new WsException(`your not allowed to accept this request`);
      }
      await this.prismaService.friendRequest.delete({
        where: { id: requestId },
      });
    } catch (e) {
      console.log(e)
      throw new WsException(`Error rejecting friend request: ${e.message}`);
    }
  }

  async getUserFromToken(token: string) {
    try {
      const { email } = await this.jwtService.verifyAsync(token);
      if (!email) throw new WsException('Invalid token');
      const user = await this.prismaService.user.findUnique({
        where: { email },
        select: { id: true,username:true },
      });
      if (!user) throw new WsException('User not found');
      return user;
    } catch (e) {
      console.log(e)
      throw new WsException(
        `Error getting user from token: ${e.message}`,
      );
    }
  }

  async sendFriendRequest(userId: string, targetUserName: string) {

    try {
      const receiver = await this.prismaService.user.findFirst({
        where: { username: targetUserName },
        include:{receivedFriendRequests: {include:{receiver:true}}}
      });


      if (!receiver){
        throw new WsException(`Receiver ${targetUserName} not found`);
      }
      if (receiver.receivedFriendRequests.find(friendRequest => friendRequest.senderId === userId)){
        throw new WsException(`You can not send request to this user again`);
      }
      const createdRequest = await this.prismaService.friendRequest.create({
        data: { senderId: userId, receiverId: receiver.id },
      })
       await Promise.all([
          this.prismaService.user.update({
           where: {id: userId},
           data: {sentFriendRequests: {set: {id: createdRequest.id}}}
         }),
          this.prismaService.user.update({
           where: {id: receiver.id},
           data: {receivedFriendRequests: {set: {id: createdRequest.id}}}
         })
       ])
      return createdRequest

    } catch (e) {
      console.log(e)
      throw new WsException(`Error sending friend request: ${e.message}`);
    }
  }
}
