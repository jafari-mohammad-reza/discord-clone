import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ModifyChannelDto } from 'src/channel/dtos/create-channel.dto';
import { CoreModule } from '../../../core/core.module';
import { PrismaService } from '../../../core/prisma.service';
import { CreateChannelHandler } from '../handlers/create-channel.handler';
import { CreateChannelCommand } from '../impl/create-channel.command';
import { HttpException, NotFoundException } from '@nestjs/common';
import { AlreadyExistException } from '../../../core/exceptions/already-exist.exception';

describe('Create channel handler', function () {
  let prismaMock: PrismaService;
  let createChannelHandler: CreateChannelHandler;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CoreModule, CqrsModule],
      providers: [CreateChannelHandler],
    }).compile();
    prismaMock = module.get<PrismaService>(PrismaService);
    createChannelHandler =
      module.get<CreateChannelHandler>(CreateChannelHandler);
  });
  it('command and handlers must be defined', function () {
    expect(createChannelHandler).toBeDefined();
  });
  it('should create channel successfully.', async function () {
    const channel: ModifyChannelDto = {
      categoryId: 'test-id',
      isPublic: true,
      title: 'test-title',
    };
    prismaMock.channel.findFirst = jest.fn().mockResolvedValue(null);
    prismaMock.category.findUnique = jest.fn().mockResolvedValue({});
    prismaMock.channel.create = jest.fn().mockResolvedValue(channel);
    const command = new CreateChannelCommand(channel, 'user-id');
    const response = await createChannelHandler.execute(command);
    expect(response).toMatchObject(channel);
  });
  it('should create channel fail title exist.', async function () {
    const channel: ModifyChannelDto = {
      categoryId: 'test-id',
      isPublic: true,
      title: 'test-title',
    };
    prismaMock.channel.findFirst = jest.fn().mockResolvedValue({});
    const command = new CreateChannelCommand(channel, 'user-id');
    await createChannelHandler.execute(command).catch((err: HttpException) => {
      expect(err).toBeInstanceOf(AlreadyExistException);
    });
  });
  it('should create channel fail category does not exist.', async function () {
    const channel: ModifyChannelDto = {
      categoryId: 'test-id',
      isPublic: true,
      title: 'test-title',
    };
    prismaMock.channel.findFirst = jest.fn().mockResolvedValue(null);
    prismaMock.category.findUnique = jest.fn().mockResolvedValue(null);
    prismaMock.channel.create = jest.fn().mockResolvedValue(channel);
    const command = new CreateChannelCommand(channel, 'user-id');
    await createChannelHandler.execute(command).catch((err: HttpException) => {
      expect(err).toBeInstanceOf(NotFoundException);
    });
  });
});
