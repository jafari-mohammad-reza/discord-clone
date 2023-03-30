import {Module} from '@nestjs/common';
import {CoreModule} from '../core/core.module';
import {CqrsModule} from '@nestjs/cqrs';
import {TopicController} from './topic.controller';
import {CreateTopicHandler} from './commands/handlers/create-topic.handler';
import {UpdateTopicHandler} from './commands/handlers/update-topic.handler';
import {DeleteTopicHandler} from './commands/handlers/delete-topic.handler';
import {ValidOwnerGuard} from '../channel/valid-owner.guard';
import {ValidTopicGuard} from './valid-topic.guard';
import {GetTopicsHandler} from './queries/handlers/get-topics.handler';
import {GetTopicHandler} from './queries/handlers/get-topic.handler';

const CommandHandlers = [
    CreateTopicHandler,
    UpdateTopicHandler,
    DeleteTopicHandler,
];
const QueryHandlers = [GetTopicsHandler, GetTopicHandler];

@Module({
    imports: [CoreModule, CqrsModule],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        ValidOwnerGuard,
        ValidTopicGuard,
    ],
    controllers: [TopicController],
})
export class TopicModule {
}
