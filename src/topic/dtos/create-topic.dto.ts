import { PickType } from '@nestjs/swagger';
import { Topic } from '../../core/classTypes/Topic';

export class CreateTopicDto extends PickType(Topic, ['name', 'channelId']) {}
