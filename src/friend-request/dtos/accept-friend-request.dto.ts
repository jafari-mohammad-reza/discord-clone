import { IsNumber } from 'class-validator';

export class AcceptFriendRequestDto {
  @IsNumber()
  requestId: number;
}
