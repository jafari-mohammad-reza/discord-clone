import {PickType} from '@nestjs/mapped-types';
import {VoiceRoom} from '../../core/classTypes/VoiceRoom';
import {IsString} from 'class-validator';

export class CreateVoiceRoomDto extends PickType(VoiceRoom, [
    'name',
    'topicId',
]) {
    @IsString()
    channelId: string;
}
