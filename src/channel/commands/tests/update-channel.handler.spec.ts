import { PrismaService } from '../../../core/prisma.service';
import { UpdateChannelHandler } from '../handlers/update-channel.handler';
import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreModule } from '../../../core/core.module';
import { UpdateChannelCommand } from '../impl/update-channel.command';
import { UpdateChannelDto } from '../../dtos/update-channel.dto';
import { HttpException, NotFoundException } from '@nestjs/common';
import { AlreadyExistException } from '../../../core/exceptions/already-exist.exception';

describe('Update channel', function() {
  let prismaMock: PrismaService;
  let updateChannelHandler: UpdateChannelHandler;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CqrsModule, CoreModule],
      providers: [UpdateChannelHandler],
    }).compile();
    prismaMock = module.get<PrismaService>(PrismaService);
    updateChannelHandler =
      module.get<UpdateChannelHandler>(UpdateChannelHandler);
  });
  it('should update channel', async function() {
    const channelUpdateDto: UpdateChannelDto = {
      categoryId: "test-id",
      title: "test-title"
    }
    prismaMock.channel.findFirst = jest.fn().mockResolvedValue(null)
    prismaMock.category.findUnique = jest.fn().mockResolvedValue({})
    prismaMock.channel.update = jest.fn().mockResolvedValue(channelUpdateDto)
    const command = new UpdateChannelCommand(
      channelUpdateDto,
      'id',
    );
    const response = await updateChannelHandler.execute(command);
    expect(response).toMatchObject(channelUpdateDto);
  });

  it('should update channel fail title exist', async function() {
    const channelUpdateDto: UpdateChannelDto = {
      categoryId: "test-id",
      title: "test-title"
    }
    prismaMock.channel.findFirst = jest.fn().mockResolvedValue({})
    const command = new UpdateChannelCommand(
      channelUpdateDto,
      'id',
    );
    await updateChannelHandler.execute(command).catch((err: HttpException) => {
      expect(err).toBeInstanceOf(AlreadyExistException)
    });
  });
  it('should update channel fail category does not exist', async function() {
    const channelUpdateDto: UpdateChannelDto = {
      categoryId: "test-id",
      title: "test-title"
    }
    prismaMock.channel.findFirst = jest.fn().mockResolvedValue(null)
    prismaMock.category.findUnique = jest.fn().mockResolvedValue(null)
    const command = new UpdateChannelCommand(
      channelUpdateDto,
      'id',
    );
    await updateChannelHandler.execute(command).catch((err: HttpException) => {
      expect(err).toBeInstanceOf(NotFoundException)
    });
  });
});
