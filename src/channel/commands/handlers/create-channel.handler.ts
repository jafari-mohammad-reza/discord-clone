import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateChannelCommand } from '../impl/create-channel.command';
import { PrismaService } from '../../../core/prisma.service';
import { AlreadyExistException } from '../../../core/exceptions/already-exist.exception';
import { NotFoundException } from '@nestjs/common';
import { DropBoxService } from '../../../drop-box/drop-box.service';
import * as path from 'path';
import { DropboxResponse, files } from 'dropbox';
import FileMetadata = files.FileMetadata;

@CommandHandler(CreateChannelCommand)
export class CreateChannelHandler
  implements ICommandHandler<CreateChannelCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dropBoxService: DropBoxService,
  ) {}
  async execute(command: CreateChannelCommand): Promise<void> {
    const { title, categoryId, file, isPublic } = command.createChannelDto;
    const { ownerId } = command;
    if (
      await this.prismaService.channel.findFirst({
        where: { title: title.trim() },
      })
    )
      throw new AlreadyExistException('Channel', 'Title');
    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException();
    // this.dropBoxService
    //   .uploadImage(
    //     file,
    //     `/channels/logo/${title.replace(' ', '-')}${path.extname(
    //       file.originalname,
    //     )}`,
    //   )
    //   .then((response: DropboxResponse<FileMetadata>) => {
    //     if (response.status === 200) {
    //       this.prismaService.channel.update({
    //         where: { title },
    //         data: { logo: response.result.rev },
    //       });
    //     }
    //   });
    await this.prismaService.channel.create({
      data: { title, categoryId, ownerId, isPublic: Boolean(isPublic) },
    });
  }
}
