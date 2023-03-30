import {Injectable} from '@nestjs/common';
import {PrismaService} from '../core/prisma.service';

export enum FriendRequestSearchBy {
    SENDER = 'sender',
    RECEIVER = 'receiver',
}

@Injectable()
export class FriendRequestService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async getFriendRequests(userId: string, searchBy: FriendRequestSearchBy) {
        const where =
            searchBy === FriendRequestSearchBy.SENDER
                ? {sender: {id: userId}}
                : {receiver: {id: userId}};
        return this.prismaService.friendRequest.findMany({where});
    }

    async acceptFriendRequest(userId: string, requestId: number) {
        const request = await this.findRequestWithUsers(requestId);
        this.validateReceiver(userId, request);
        await this.updateFriends(request);
        await this.deleteRequest(requestId);
        return {sender: request.sender.username, receiver: request.receiver.username};
    }

    async rejectFriendRequest(userId: string, requestId: number) {
        const request = await this.findRequest(requestId);
        this.validateReceiver(userId, request);
        await this.deleteRequest(requestId);
    }

    async sendFriendRequest(userId: string, targetUserName: string) {
        const receiver = await this.findReceiver(targetUserName);
        this.validateDuplicateRequest(userId, receiver);
        const createdRequest = await this.createRequest(userId, receiver.id);
        await this.connectUsersToRequest(userId, receiver.id, createdRequest.id);
        return createdRequest;
    }

    private async findRequestWithUsers(requestId: number) {
        const request = await this.prismaService.friendRequest.findFirst({
            where: {id: requestId},
            include: {
                sender: {select: {username: true}},
                receiver: {select: {username: true}},
            },
        });
        if (!request) throw new Error(`Friend request ${requestId} not found`);
        return request;
    }

    private async findRequest(requestId: number) {
        const request = await this.prismaService.friendRequest.findFirst({where: {id: requestId}});
        if (!request) throw new Error(`Friend request ${requestId} not found`);
        return request;
    }

    private validateReceiver(userId: string, request: any) {
        if (request.receiverId !== userId) throw new Error(`You're not allowed to accept this request`);
    }

    private async updateFriends(request: any) {
        await Promise.all([
            this.prismaService.user.update({
                where: {id: request.senderId},
                data: {friends: {set: {id: request.receiverId}}},
            }),
            this.prismaService.user.update({
                where: {id: request.receiverId},
                data: {friends: {set: {id: request.senderId}}},
            }),
        ]);
    }

    private async deleteRequest(requestId: number) {
        await this.prismaService.friendRequest.delete({where: {id: requestId}});
    }

    private async findReceiver(targetUserName: string) {
        const receiver = await this.prismaService.user.findFirst({
            where: {username: targetUserName},
            include: {receivedFriendRequests: {include: {receiver: true}}},
        });
        if (!receiver) throw new Error(`Receiver ${targetUserName} not found`);
        return receiver;
    }

    private validateDuplicateRequest(userId: string, receiver: any) {
        if (receiver.receivedFriendRequests.find((friendRequest) => friendRequest.senderId === userId)) {
            throw new Error(`You cannot send a request to this user again`);
        }
    }

    private async createRequest(senderId: string, receiverId: string) {
        return this.prismaService.friendRequest.create({data: {senderId, receiverId}});
    }

    private async connectUsersToRequest(senderId: string, receiverId: string, requestId: number) {
        await Promise.all([
            this.prismaService.user.update({
                where: {id: senderId},
                data: {sentFriendRequests: {connect: {id: requestId}}},
            }),
            this.prismaService.user.update({
                where: {id: receiverId},
                data: {receivedFriendRequests: {connect: {id: requestId}}},
            }),
        ]);
    }
}