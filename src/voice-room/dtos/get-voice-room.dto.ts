import {IsString} from 'class-validator';

export class GetVoiceRoomDto {
    @IsString()
    voiceRoomId: string;

}
