import { ApiProperty, PickType } from '@nestjs/swagger';
import { Channel } from '../../core/classTypes/Channel';
import { IsEmpty, IsOptional } from 'class-validator';

export class CreateChannelDto extends PickType(Channel, [
  'title',
  'categoryId',
  'isPublic',
]) {
  @ApiProperty({ type: String, format: 'binary', required: true })
  @IsOptional()
  file?: Express.Multer.File;
}
