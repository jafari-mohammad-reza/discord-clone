import { PickType } from "@nestjs/swagger";
import { User } from "../../core/classTypes/User";

export class SendForgotPasswordDto extends PickType(User, ["email"]) {
}

export class ForgotPasswordDto extends PickType(User, ["password"]) {
}
