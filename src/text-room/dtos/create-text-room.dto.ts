import { IsNumber, IsString } from 'class-validator';

export class CreateTextRoomDto {
  @IsString()
  channelId: string;
  @IsString()
  textRoomName: string;
  @IsNumber()
  topicId: number;
}
