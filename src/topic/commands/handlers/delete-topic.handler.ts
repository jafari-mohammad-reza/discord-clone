import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTopicCommand } from '../impl/create-topic.command';
import { DeleteTopicCommand } from '../impl/delete-topic.command';

@CommandHandler(DeleteTopicCommand)
export class DeleteTopicHandler implements ICommandHandler<DeleteTopicCommand> {
  execute(command: DeleteTopicCommand): Promise<any> {
    return Promise.resolve(undefined);
  }
}
