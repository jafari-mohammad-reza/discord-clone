import { Channel } from "../../core/classTypes/Channel";
import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
import { IsEmpty, IsOptional } from "class-validator";

export class UpdateChannelDto extends PickType(PartialType(Channel), [
  "isPublic",
  "categoryId",
  "title"
]) {
  @ApiProperty({ type: String, format: "binary", required: false })
  @IsOptional()
  @IsEmpty()
  file?: Express.Multer.File;
}
