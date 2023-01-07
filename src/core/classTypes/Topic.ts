import { Topic as TopicType } from '@prisma/client/generated';
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Topic implements TopicType {
  @IsUUID()
  @ApiProperty({ type: String, required: true, name: 'channel id' })
  channelId: string;
  id: number;
  @IsString()
  @ApiProperty({ type: String, required: true, name: 'name' })
  name: string;
}
