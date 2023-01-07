import { CreateTopicDto } from '../../dtos/create-topic.dto';

export class CreateTopicCommand {
  constructor(public readonly dto: CreateTopicDto) {}
}
