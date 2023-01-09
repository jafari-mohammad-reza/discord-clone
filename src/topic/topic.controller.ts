import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTopicCommand } from './commands/impl/create-topic.command';
import { ModifyTopicDto } from './dtos/modify-topic.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateTopicCommand } from './commands/impl/update-topic.command';
import { ValidOwnerGuard } from '../channel/valid-owner.guard';
import { DeleteTopicCommand } from './commands/impl/delete-topic.command';
import { GetTopicsQuery } from './queries/impl/get-topics.query';
import { GetTopicQuery } from './queries/impl/get-topic.query';
import { ValidTopicGuard } from './valid-topic.guard';

@Controller({
  path: 'topic',
  version: '1',
})
@ApiTags('Topic')
export class TopicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getTopics() {
    return await this.queryBus.execute(new GetTopicsQuery());
  }

  @Get('/:topicId')
  @ApiParam({ type: Number, required: true, name: 'topicId' })
  async getTopic(@Param('topicId') id: string) {
    if (!Number(id)) throw new BadRequestException('id is a number');
    return await this.queryBus.execute(new GetTopicQuery(id));
  }

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(ValidOwnerGuard)
  @ApiBody({ type: ModifyTopicDto, required: true })
  async createTopic(@Body() dto: ModifyTopicDto) {
    return await this.commandBus.execute(new CreateTopicCommand(dto));
  }

  @Patch('/:topicId')
  @UseGuards(ValidTopicGuard)
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(ValidOwnerGuard)
  @ApiBody({ type: ModifyTopicDto, required: true })
  @ApiParam({ type: Number, required: true, name: 'topicId' })
  async updateTopic(@Param('topicId') id: string, @Body() dto: ModifyTopicDto) {
    if (!Number(id)) throw new BadRequestException('id is a number');
    return await this.commandBus.execute(new UpdateTopicCommand(+id, dto));
  }

  @Delete('/:topicId')
  @UseGuards(ValidOwnerGuard)
  @UseGuards(ValidTopicGuard)
  @ApiQuery({ type: String, required: true, name: 'channelId' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiParam({ type: Number, required: true, name: 'topicId' })
  async deleteTopic(
    @Param('topicId') id: string,
    @Query('channelId') channelId: string,
  ) {
    if (!Number(id)) throw new BadRequestException('id is a number');
    return await this.commandBus.execute(new DeleteTopicCommand(+id));
  }
}
