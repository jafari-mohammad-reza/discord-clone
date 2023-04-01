import {IsString, Max} from 'class-validator';

export class SendMessageDto {
    @IsString()
    @Max(150)
    content: string;
    @IsString()
    textRoomId: string;
}
