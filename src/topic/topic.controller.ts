import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateTopicCommand } from './commands/impl/create-topic.command';
import { CreateTopicDto } from './dtos/create-topic.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateTopicDto } from './dtos/update-topic.dto';
import { UpdateTopicCommand } from './commands/impl/update-topic.command';
import { ValidOwnerGuard } from '../channel/valid-owner.guard';
import { DeleteTopicCommand } from './commands/impl/delete-topic.command';
import { GetTopicsQuery } from './queries/impl/get-topics.query';
import { GetTopicQuery } from './queries/impl/get-topic.query';

@Controller({
  path: 'topic',
  version: '1',
})
@ApiTags('Topic')
@UseGuards(ValidOwnerGuard)
export class TopicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @Get()
  async getTopics() {
    return await this.queryBus.execute(new GetTopicsQuery());
  }
  @Get('/:id')
  @ApiParam({ type: String, required: true, name: 'id' })
  async getTopic(@Param('id') id: string) {
    return await this.queryBus.execute(new GetTopicQuery(id));
  }
  @Post()
  @ApiBody({ type: CreateTopicDto, required: true })
  async createTopic(@Body() dto: CreateTopicDto) {
    return await this.commandBus.execute(new CreateTopicCommand(dto));
  }
  @Patch('/:id')
  @ApiBody({ type: UpdateTopicDto, required: true })
  async updateTopic(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return await this.commandBus.execute(new UpdateTopicCommand(dto));
  }
  @Delete('/:id')
  @ApiParam({ type: String, required: true, name: 'id' })
  async deleteTopic(@Param('id') id: string) {
    return await this.commandBus.execute(new DeleteTopicCommand(id));
  }
}
