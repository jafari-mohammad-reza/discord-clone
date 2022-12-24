import { PartialType } from '@nestjs/mapped-types';
import { Channel } from '../../core/classTypes/Channel';

export class UpdateChannelDto extends PartialType(Channel) {}
