import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTopicCommand } from '../impl/create-topic.command';

@CommandHandler(CreateTopicCommand)
export class CreateTopicHandler implements ICommandHandler<CreateTopicCommand> {
  execute(command: CreateTopicCommand): Promise<any> {
    return Promise.resolve(undefined);
  }
}
