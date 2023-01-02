import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { expectCt } from 'helmet';
import { User } from '../../../core/classTypes/User';
import { CoreModule } from '../../../core/core.module';
import { PrismaService } from '../../../core/prisma.service';
import { LeaveChannelHandler } from '../handlers/leave-channel.handler';
import { BadRequestException, HttpException } from '@nestjs/common';

describe('leave channel', function () {
  let prisma: PrismaService;
  let leaveChannelHandler: LeaveChannelHandler;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CoreModule, CqrsModule],
      providers: [LeaveChannelHandler],
    }).compile();
    prisma = module.get<PrismaService>(PrismaService);
    leaveChannelHandler = module.get<LeaveChannelHandler>(LeaveChannelHandler);
  });
  it('should leave channel successfully.', async function () {
    const channel = {
      id: 'channel-id',
      isPublic: true,
      ownerId: 'owner-id',
      members: [{ id: 'user-id' }],
    };
    prisma.channel.findUniqueOrThrow = jest.fn().mockResolvedValue(channel);
    prisma.channel.update = jest.fn().mockResolvedValue(channel);
    const user = new User();
    user.id = 'user-id';
    const response = await leaveChannelHandler.execute({
      channelId: 'channel-id',
      user,
    });
    expect(response).toMatchObject(channel);
  });
  it('should leave channel fail user is not in channel.', async function () {
    const channel = {
      id: 'channel-id',
      isPublic: true,
      ownerId: 'owner-id',
      members: [{ id: 'some-user' }],
    };
    prisma.channel.findUniqueOrThrow = jest.fn().mockResolvedValue(channel);
    prisma.channel.update = jest.fn().mockResolvedValue(channel);
    const user = new User();
    user.id = 'user-id';
    await leaveChannelHandler
      .execute({
        channelId: 'channel-id',
        user,
      })
      .catch((err: HttpException) => {
        expect(err.message).toMatch('you are not in this channel');
        expect(err).toBeInstanceOf(BadRequestException);
      });
  });
  it('should leave channel fail user is owner.', async function () {
    const channel = {
      id: 'channel-id',
      isPublic: true,
      ownerId: 'owner-id',
      members: [{ id: 'owner-id' }],
    };
    prisma.channel.findUniqueOrThrow = jest.fn().mockResolvedValue(channel);
    prisma.channel.update = jest.fn().mockResolvedValue(channel);
    const user = new User();
    user.id = 'owner-id';
    await leaveChannelHandler
      .execute({
        channelId: 'channel-id',
        user,
      })
      .catch((err: HttpException) => {
        expect(err.message).toMatch('you are owner you cannot leave');
        expect(err).toBeInstanceOf(BadRequestException);
      });
  });
});
