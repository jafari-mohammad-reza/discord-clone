import { PartialType, PickType } from '@nestjs/swagger';
import { Topic } from '../../core/classTypes/Topic';

export class UpdateTopicDto extends PickType(PartialType(Topic), [
  'name',
  'channelId',
]) {}
