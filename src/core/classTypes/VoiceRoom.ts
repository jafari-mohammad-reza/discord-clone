import { VoiceRoom as VoiceRoomType } from '@prisma/client/generated';
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoiceRoom implements VoiceRoomType {
  id: string;
  @IsString()
  @ApiProperty({ type: String, required: true })
  name: string;
  @IsUUID()
  @ApiProperty({ type: String, required: true })
  topicId: number;
}
