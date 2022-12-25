
import { Channel } from '../../core/classTypes/Channel';
import { ApiProperty, PickType,PartialType } from "@nestjs/swagger";

export class UpdateChannelDto extends PickType(PartialType(Channel) , ['isPublic' , 'categoryId'  , 'title']) {
  @ApiProperty({type:String,format:'binary',required:false})
  file:Express.Multer.File
}
