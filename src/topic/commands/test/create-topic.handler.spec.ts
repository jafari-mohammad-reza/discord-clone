import { PrismaService } from '../../../core/prisma.service';
import { CreateTopicCommand } from '../impl/create-topic.command';
import { CreateTopicHandler } from '../handlers/create-topic.handler';
import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreModule } from '../../../core/core.module';
import { ModifyTopicDto } from '../../dtos/modify-topic.dto';
import { HttpException, NotFoundException } from '@nestjs/common';
import { AlreadyExistException } from '../../../core/exceptions/already-exist.exception';

describe('create topic handler', function () {
  let prismaService: PrismaService;
  let createTopicHandler: CreateTopicHandler;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CqrsModule, CoreModule],
      providers: [CreateTopicHandler],
    }).compile();
    prismaService = module.get<PrismaService>(PrismaService);
    createTopicHandler = module.get<CreateTopicHandler>(CreateTopicHandler);
  });
  it('should create topic successfully', async function () {
    const topicDto: ModifyTopicDto = {
      name: 'Test-topic',
      channelId: 'some-channel-id',
    };
    prismaService.topic.findFirst = jest.fn().mockResolvedValue(null);
    prismaService.channel.findUnique = jest.fn().mockResolvedValue({});
    prismaService.topic.create = jest.fn().mockResolvedValue(topicDto);
    const response = await createTopicHandler.execute({ dto: topicDto });
    expect(response).toMatchObject(topicDto);
  });
  it('should create topic fail there is already a topic with this id', async function () {
    const topicDto: ModifyTopicDto = {
      name: 'Test-topic',
      channelId: 'some-channel-id',
    };
    prismaService.topic.findFirst = jest.fn().mockResolvedValue({});
    await createTopicHandler
      .execute({ dto: topicDto })
      .catch((err: HttpException) => {
        expect(err).toBeInstanceOf(AlreadyExistException);
      });
  });
  it('should create topic fail channel not exist', async function () {
    const topicDto: ModifyTopicDto = {
      name: 'Test-topic',
      channelId: 'some-channel-id',
    };
    prismaService.topic.findFirst = jest.fn().mockResolvedValue(null);
    prismaService.channel.findUnique = jest.fn().mockResolvedValue(null);
    await createTopicHandler
      .execute({ dto: topicDto })
      .catch((err: HttpException) => {
        expect(err).toBeInstanceOf(NotFoundException);
      });
  });
});
