import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { expectCt } from 'helmet';
import { User } from '../../../core/classTypes/User';
import { CoreModule } from '../../../core/core.module';
import { PrismaService } from '../../../core/prisma.service';
import { JoinChannelHandler } from '../handlers/join-channel.handler';
import { BadRequestException, HttpException } from '@nestjs/common';

describe('Join channel', function () {
  let prisma: PrismaService;
  let joinChannelHandler: JoinChannelHandler;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CoreModule, CqrsModule],
      providers: [JoinChannelHandler],
    }).compile();
    prisma = module.get<PrismaService>(PrismaService);
    joinChannelHandler = module.get<JoinChannelHandler>(JoinChannelHandler);
  });
  it('should join channel successfully.', async function () {
    const channel = {
      id: 'channel-id',
      isPublic: true,
      ownerId: '1',
      members: [{ id: '2' }],
    };
    prisma.channel.findUniqueOrThrow = jest.fn().mockResolvedValue(channel);
    prisma.channel.update = jest.fn().mockResolvedValue(channel);
    const user = new User();
    user.id = 'user-id';
    const response = await joinChannelHandler.execute({
      id: 'channel-id',
      user,
    });
    expect(response).toMatchObject(channel);
  });
  it('should join channel fail channel is private.', async function () {
    const channel = {
      id: 'channel-id',
      isPublic: false,
      ownerId: '1',
      members: [{ id: '2' }],
    };
    prisma.channel.findUniqueOrThrow = jest.fn().mockResolvedValue(channel);
    const user = new User();
    user.id = 'user-id';
    await joinChannelHandler
      .execute({
        id: 'channel-id',
        user,
      })
      .catch((err: HttpException) => {
        expect(err.message).toMatch('Channel is not public');
        expect(err).toBeInstanceOf(BadRequestException);
      });
  });
  it('should join channel fail user is owner.', async function () {
    const channel = {
      id: 'channel-id',
      isPublic: true,
      ownerId: 'user-id',
      members: [{ id: '2' }],
    };
    prisma.channel.findUniqueOrThrow = jest.fn().mockResolvedValue(channel);
    const user = new User();
    user.id = 'user-id';
    await joinChannelHandler
      .execute({
        id: 'channel-id',
        user,
      })
      .catch((err: HttpException) => {
        expect(err.message).toMatch('you are owner');
        expect(err).toBeInstanceOf(BadRequestException);
      });
  });
  it('should join channel fail user is already joined.', async function () {
    const channel = {
      id: 'channel-id',
      isPublic: true,
      ownerId: 'owner-id',
      members: [{ id: 'user-id' }],
    };
    prisma.channel.findUniqueOrThrow = jest.fn().mockResolvedValue(channel);
    const user = new User();
    user.id = 'user-id';
    await joinChannelHandler
      .execute({
        id: 'channel-id',
        user,
      })
      .catch((err: HttpException) => {
        expect(err.message).toMatch('you are already in this channel');
        expect(err).toBeInstanceOf(BadRequestException);
      });
  });
});
