import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { CqrsModule } from '@nestjs/cqrs';
import { TopicController } from './topic.controller';
import { CreateTopicHandler } from './commands/handlers/create-topic.handler';
import { UpdateTopicHandler } from './commands/handlers/update-topic.handler';
import { DeleteTopicHandler } from './commands/handlers/delete-topic.handler';
import { ValidOwnerGuard } from '../channel/valid-owner.guard';

const CommandHandlers = [
  CreateTopicHandler,
  UpdateTopicHandler,
  DeleteTopicHandler,
];
@Module({
  imports: [CoreModule, CqrsModule],
  providers: [...CommandHandlers, ValidOwnerGuard],
  controllers: [TopicController],
})
export class TopicModule {}
