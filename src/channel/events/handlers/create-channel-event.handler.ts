import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CreateChannelEvent } from '../impl/create-channel.event';
import { PrismaService } from '../../../core/prisma.service';
import { DropBoxService } from '../../../drop-box/drop-box.service';
import * as path from 'path';
import { DropboxResponse, files } from 'dropbox';
import FileMetadata = files.FileMetadata;
import { InternalServerErrorException } from '@nestjs/common';

@EventsHandler(CreateChannelEvent)
export class CreateChannelEventHandler
  implements IEventHandler<CreateChannelEvent>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dropBoxService: DropBoxService,
  ) {}
  handle(event: CreateChannelEvent): void {
    const { channel, file } = event;
    const { title } = channel;
    this.dropBoxService
      .uploadImage(
        file,
        `/channels/logo/${title.replace(' ', '-')}       ${Date.now()}
${path.extname(file.originalname)}`,
      )
      .then(async (response: DropboxResponse<FileMetadata>) => {
        if (response.status === 200) {
          await this.prismaService.channel.update({
            where: { title },
            data: {
              logo: response.result.rev,
              logoPath: response.result.path_display,
            },
          });
        }
      })
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
    // TODO add this channel to elastic search
  }
}
