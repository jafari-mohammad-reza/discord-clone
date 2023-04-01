import { PickType } from '@nestjs/swagger';
import { Topic } from '../../core/classTypes/Topic';

export class ModifyTopicDto extends PickType(Topic, [
  'name',
  'channelId',
]) {}
