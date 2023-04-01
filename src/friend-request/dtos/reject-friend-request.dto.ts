import {IsNumber} from 'class-validator';

export class RejectFriendRequestDto {
    @IsNumber()
    requestId: number;
}
