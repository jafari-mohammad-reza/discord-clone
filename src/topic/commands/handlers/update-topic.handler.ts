import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTopicCommand } from '../impl/create-topic.command';
import { UpdateTopicCommand } from '../impl/update-topic.command';

@CommandHandler(UpdateTopicCommand)
export class UpdateTopicHandler implements ICommandHandler<UpdateTopicCommand> {
  execute(command: UpdateTopicCommand): Promise<any> {
    return Promise.resolve(undefined);
  }
}
