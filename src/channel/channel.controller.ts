import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateChannelDto } from "./dtos/create-channel.dto";
import { AuthUser } from "../auth/auth-user.decorator";
import { User } from "@prisma/client/generated";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateChannelCommand } from "./commands/impl/create-channel.command";
import { UpdateChannelDto } from "./dtos/update-channel.dto";
import { ValidOwnerGuard } from "./valid-owner.guard";
import { UpdateChannelCommand } from "./commands/impl/update-channel.command";
import { DeleteChannelCommand } from "./commands/impl/delete-channel.command";
import { GetChannelQuery } from "./queries/impl/get-channel.query";
import { JoinChannelCommand } from "./commands/impl/join-channel.command";
import { LeaveChannelCommand } from "./commands/impl/leave-channel.command";
import { KickFromChannelCommand } from "./commands/impl/kick-from-channel.command";

@Controller({
  path: "channels",
  version: "1"
})
@ApiTags("Channel")
export class ChannelController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
  }

  @Get()
  @ApiQuery({ type: String, name: "identifier", required: false })
  async getChannels(@Query("identifier") identifier?: string) {
    return this.queryBus.execute(new GetChannelQuery(identifier));
  }

  @Post()
  @ApiBody({ type: CreateChannelDto, required: true })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async createChannel(
    @Body() createChannelDto: CreateChannelDto,
    @AuthUser() authUser: User,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: ".*.(gif|jpe?g|png)" })
        ]
      })
    )
      file: Express.Multer.File
  ) {
    createChannelDto.file = file;
    return await this.commandBus.execute(
      new CreateChannelCommand(createChannelDto, authUser.id)
    );
  }

  @Post("join/:id")
  @HttpCode(200)
  @ApiParam({
    type: String,
    required: true,
    name: "id",
    description: "channel id"
  })
  async joinToChannel(@Param("id") id: string, @AuthUser() user: User) {
    return await this.commandBus.execute(new JoinChannelCommand(id, user));
  }

  @Post("leave/:id")
  @HttpCode(200)
  @ApiParam({
    type: String,
    required: true,
    name: "id",
    description: "channel id"
  })
  async leaveChannel(@Param("id") id: string, @AuthUser() user: User) {
    return await this.commandBus.execute(new LeaveChannelCommand(id, user));
  }

  @Post("kick/:userId")
  @HttpCode(200)
  @UseGuards(ValidOwnerGuard)
  @ApiParam({
    type: String,
    required: true,
    name: "userId",
    description: "user id"
  })
  @ApiQuery({ type: String, required: true, name: "channelId" })
  async kickUserFromChannel(
    @Param("userId") id: string,
    @Query("channelId") channelId: string
  ) {
    return await this.commandBus.execute(
      new KickFromChannelCommand(id, channelId)
    );
  }

  @Patch(":id")
  @ApiBody({ type: UpdateChannelDto, required: true })
  @ApiParam({ type: String, required: true, name: "id" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  @UseGuards(ValidOwnerGuard)
  async updateChannel(
    @Param("id") id: string,
    @Body() updateChannelDto: UpdateChannelDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: ".*.(gif|jpe?g|png)" })
        ]
      })
    )
      file: Express.Multer.File
  ) {
    updateChannelDto.file = file;
    return await this.commandBus.execute(
      new UpdateChannelCommand(updateChannelDto, id)
    );
  }

  @Delete(":id")
  @UseGuards(ValidOwnerGuard)
  async removeChannel(@Param("id") id: string) {
    return await this.commandBus.execute(new DeleteChannelCommand(id));
  }
}
