import { PrismaService } from '../../../core/prisma.service';
import { DeleteChannelHandler } from '../handlers/delete-channel.handler';
import { Test } from '@nestjs/testing';
import { CoreModule } from '../../../core/core.module';
import { CqrsModule } from '@nestjs/cqrs';
import { Channel, prisma } from '@prisma/client/generated';
import { HttpException, NotFoundException } from '@nestjs/common';

describe('Delete Channel', function () {
  let prismaMock: PrismaService;
  let deleteChannelHandler: DeleteChannelHandler;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CoreModule, CqrsModule],
      providers: [DeleteChannelHandler],
    }).compile();
    prismaMock = module.get<PrismaService>(PrismaService);
    deleteChannelHandler =
      module.get<DeleteChannelHandler>(DeleteChannelHandler);
  });
  it('should delete channel successfully', async function () {
    prismaMock.channel.findUnique = jest.fn().mockResolvedValue({ id: 'test' });
    prismaMock.channel.delete = jest.fn().mockResolvedValue({ id: 'test' });
    const response = await deleteChannelHandler.execute({ id: 'test' });
    expect(response).toMatchObject({ id: 'test' });
  });
  it('should delete channel fail it does not exist', async function () {
    prismaMock.channel.findUnique = jest.fn().mockResolvedValue(null);

    await deleteChannelHandler
      .execute({ id: 'id' })
      .catch((err: HttpException) => {
        expect(err).toBeInstanceOf(NotFoundException);
      });
  });
});
