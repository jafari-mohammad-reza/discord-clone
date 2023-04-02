import {PickType} from "@nestjs/mapped-types";
import {VoiceRoom} from "../../core/classTypes/VoiceRoom";

export class CreateVoiceRoomDto extends PickType(VoiceRoom,['name' , 'topicId']){}