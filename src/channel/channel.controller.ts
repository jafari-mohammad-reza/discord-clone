import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from '@prisma/client/generated';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateChannelCommand } from './commands/impl/create-channel.command';
import { UpdateChannelDto } from './dtos/update-channel.dto';
import { ValidOwnerGuard } from './valid-owner.guard';
import * as string_decoder from 'string_decoder';
import { UpdateChannelCommand } from './commands/impl/update-channel.command';
import { DeleteChannelCommand } from './commands/impl/delete-channel.command';
import { GetChannelQuery } from './queries/impl/get-channel.query';

@Controller({
  path: 'channels',
  version: '1',
})
@ApiTags('Channel')
export class ChannelController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @Get()
  @ApiQuery({ type: String, name: 'identifier', required: true })
  async getChannels(@Query('identifier') identifier: string) {
    return this.queryBus.execute(new GetChannelQuery(identifier));
  }
  @Post()
  @ApiBody({ type: CreateChannelDto, required: true })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async createChannel(
    @Body() createChannelDto: CreateChannelDto,
    @AuthUser() authUser: User,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: '.*.(gif|jpe?g|png)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      createChannelDto.file = file;
      return await this.commandBus.execute(
        new CreateChannelCommand(createChannelDto, authUser.id),
      );
    } catch (err) {
      return err.message;
    }
  }

  @Patch(':id')
  @ApiBody({ type: UpdateChannelDto, required: true })
  @ApiParam({ type: String, required: true, name: 'id' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(ValidOwnerGuard)
  async updateChannel(
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: '.*.(gif|jpe?g|png)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      updateChannelDto.file = file;
      return await this.commandBus.execute(
        new UpdateChannelCommand(updateChannelDto, id),
      );
    } catch (err) {
      return err.message;
    }
  }

  @Delete(':id')
  @UseGuards(ValidOwnerGuard)
  async removeChannel(@Param('id') id: string) {
    try {
      return await this.commandBus.execute(new DeleteChannelCommand(id));
    } catch (err) {
      return err.message;
    }
  }
}
