import { UpdateTopicDto } from '../../dtos/update-topic.dto';

export class UpdateTopicCommand {
  constructor(public readonly dto: UpdateTopicDto) {}
}
