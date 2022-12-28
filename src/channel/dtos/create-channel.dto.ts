import { ApiProperty, PickType } from '@nestjs/swagger';
import { Channel } from '../../core/classTypes/Channel';

export class CreateChannelDto extends PickType(Channel, [
  'id',
  'title',
  'categoryId',
  'isPublic',
]) {
  @ApiProperty({ type: String, format: 'binary', required: true })
  file: Express.Multer.File;
}
