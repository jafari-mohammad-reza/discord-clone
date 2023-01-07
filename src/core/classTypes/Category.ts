import { Category as CategoryType } from "@prisma/client/generated";
import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class Category implements CategoryType {
  id: string;
  @IsString()
  @ApiProperty({ type: String, name: "title" })
  title: string;
}
