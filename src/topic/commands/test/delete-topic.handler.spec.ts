import { PrismaService } from '../../../core/prisma.service';
import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreModule } from '../../../core/core.module';
import { DeleteTopicHandler } from '../handlers/delete-topic.handler';
import { HttpException, NotFoundException } from '@nestjs/common';

describe('delete topic command handler', function () {
  let prismaService: PrismaService;
  let deleteTopicHandler: DeleteTopicHandler;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CqrsModule, CoreModule],
      providers: [DeleteTopicHandler],
    }).compile();
    prismaService = module.get<PrismaService>(PrismaService);
    deleteTopicHandler = module.get<DeleteTopicHandler>(DeleteTopicHandler);
  });
  it('should delete topic successfully', async function () {
    prismaService.topic.findUnique = jest.fn().mockResolvedValue({});
    prismaService.topic.delete = jest.fn().mockResolvedValue({ id: 1 });
    const response = await deleteTopicHandler.execute({ id: 1 });
    expect(response).toMatchObject({ id: 1 });
  });
  it('should delete topic fail topic not found', async function () {
    prismaService.topic.findUnique = jest.fn().mockResolvedValue(null);
    await deleteTopicHandler.execute({ id: 1 }).catch((err: HttpException) => {
      expect(err).toBeInstanceOf(NotFoundException);
    });
  });
});
