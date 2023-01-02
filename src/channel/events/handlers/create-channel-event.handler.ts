import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CreateChannelEvent } from '../impl/create-channel.event';
import { PrismaService } from '../../../core/prisma.service';
import { DropBoxService } from '../../../drop-box/drop-box.service';
import * as path from 'path';
import { DropboxResponse, files } from 'dropbox';
import { InternalServerErrorException } from '@nestjs/common';
import FileMetadata = files.FileMetadata;
import ReturnUploadPath from '../../../core/utils/returnUploadPath';
import { SearchService } from '../../../search/search.service';

@EventsHandler(CreateChannelEvent)
export class CreateChannelEventHandler
  implements IEventHandler<CreateChannelEvent>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dropBoxService: DropBoxService,
    private readonly searchService: SearchService,
  ) { }

  async handle(event: CreateChannelEvent): Promise<void> {
    const { channel, file } = event;
    const { title } = channel;
    const response = await this.dropBoxService.uploadImage(
      file,
      ReturnUploadPath('channel/logo', title, file),
    );
    if (response.status === 200) {
      const newChannel = await this.prismaService.channel.update({
        where: { title },
        data: {
          logo: response.result.rev,
          logoPath: response.result.path_display,
        },
      });
      await this.searchService.addIndex(channel);
    }

  }
}
