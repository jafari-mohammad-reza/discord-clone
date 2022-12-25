import { PickType } from '@nestjs/swagger';
import { Channel } from '../../core/classTypes/Channel';
import { ApiProperty } from "@nestjs/swagger";
import { Matches } from "class-validator";


export class CreateChannelDto extends PickType(Channel, [
  'id',
  'title',
  'categoryId',
  'isPublic'
]) {
  @ApiProperty({type:String,format:'binary',required:true})
  file:Express.Multer.File
}
