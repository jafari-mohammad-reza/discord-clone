import {IsString} from "class-validator";

export class GetTextRoomDto{
    @IsString()
    textRoomId:string;
}