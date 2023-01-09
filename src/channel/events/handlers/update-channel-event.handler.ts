import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { PrismaService } from '../../../core/prisma.service';
import { DropBoxService } from '../../../drop-box/drop-box.service';
import { DropboxResponse, files } from 'dropbox';
import { InternalServerErrorException } from '@nestjs/common';
import { UpdateChannelEvent } from '../impl/update-channel.event';
import ReturnUploadPath from '../../../core/utils/returnUploadPath';
import { SearchService } from '../../../search/search.service';
import FileMetadata = files.FileMetadata;

@EventsHandler(UpdateChannelEvent)
export class UpdateChannelEventHandler
  implements IEventHandler<UpdateChannelEvent>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dropBoxService: DropBoxService,
    private readonly searchService: SearchService,
  ) {}

  handle(event: UpdateChannelEvent): void {
    try {
      const { channel, file } = event;
      const { title } = channel;
      this.dropBoxService.deleteImage(channel.logo, channel.logoPath);
      this.dropBoxService
        .uploadImage(file, ReturnUploadPath('channel/logo', title, file))
        .then(async (response: DropboxResponse<FileMetadata>) => {
          if (response.status === 200) {
            const updatedChannel = await this.prismaService.channel.update({
              where: { title },
              data: {
                logo: response.result.rev,
                logoPath: response.result.path_display,
              },
            });
            await this.searchService.updateIndex(channel.id, updatedChannel);
          }
        })
        .catch((err) => {
          throw new InternalServerErrorException(err);
        });
    } catch (err) {
      console.error(err);

      return;
    }
  }
}
