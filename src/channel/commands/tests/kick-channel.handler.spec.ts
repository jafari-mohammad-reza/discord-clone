import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { expectCt } from 'helmet';
import { User } from '../../../core/classTypes/User';
import { CoreModule } from '../../../core/core.module';
import { PrismaService } from '../../../core/prisma.service';
import { BadRequestException, HttpException } from '@nestjs/common';
import { KickFromChannelHandler } from '../handlers/kick-from-channel.handler';

describe('leave channel', function () {
  let prisma: PrismaService;
  let kickFromChannelHandler: KickFromChannelHandler;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CoreModule, CqrsModule],
      providers: [KickFromChannelHandler],
    }).compile();
    prisma = module.get<PrismaService>(PrismaService);
    kickFromChannelHandler = module.get<KickFromChannelHandler>(
      KickFromChannelHandler,
    );
  });
  it('should kick user from channel successfully.', async function () {
    const channel = {
      id: 'channel-id',
      isPublic: true,
      ownerId: 'owner-id',
      members: [{ id: 'user-id' }],
    };
    prisma.channel.findUniqueOrThrow = jest.fn().mockResolvedValue(channel);
    prisma.channel.update = jest.fn().mockResolvedValue(channel);
    const response = await kickFromChannelHandler.execute({
      userId: 'user-id',
      channelId: 'channel-id',
    });
    expect(response).toMatchObject(channel);
  });
  it('should kick user from channel successfully.', async function () {
    const channel = {
      id: 'channel-id',
      isPublic: true,
      ownerId: 'owner-id',
      members: [{ id: 'some-user' }],
    };
    prisma.channel.findUniqueOrThrow = jest.fn().mockResolvedValue(channel);
    prisma.channel.update = jest.fn().mockResolvedValue(channel);
    await kickFromChannelHandler
      .execute({
        userId: 'user-id',
        channelId: 'chausernnel-id',
      })
      .catch((err: HttpException) => {
        expect(err.message).toMatch('this user is not in channel');
        expect(err).toBeInstanceOf(BadRequestException);
      });
  });
  it('should kick user from channel successfully.', async function () {
    const channel = {
      id: 'channel-id',
      isPublic: true,
      ownerId: 'owner-id',
      members: [{ id: 'owner-id' }],
    };
    prisma.channel.findUniqueOrThrow = jest.fn().mockResolvedValue(channel);
    prisma.channel.update = jest.fn().mockResolvedValue(channel);
    await kickFromChannelHandler
      .execute({
        userId: 'owner-id',
        channelId: 'channel-id',
      })
      .catch((err: HttpException) => {
        expect(err.message).toMatch('you can not remove this user');
        expect(err).toBeInstanceOf(BadRequestException);
      });
  });
});
