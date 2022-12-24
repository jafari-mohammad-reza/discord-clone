import { PickType } from '@nestjs/mapped-types';
import { Channel } from '../../core/classTypes/Channel';

export class CreateChannelDto extends PickType(Channel, [
  'id',
  'ownerId',
  'title',
  'categoryId',
]) {}
