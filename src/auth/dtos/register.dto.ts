import { PickType } from "@nestjs/swagger";
import { User } from "../../core/classTypes/User";

export class RegisterDto extends PickType(User, [
  "email",
  "username",
  "password"
]) {
}
