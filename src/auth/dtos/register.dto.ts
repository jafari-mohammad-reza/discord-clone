import { IsEmail, IsString, Length, Matches } from "class-validator";

export class RegisterDto {
    @IsEmail()
    // Only allow gmail or google mail addreses
    @Matches(/^[a-z0-9]((\.|\+)?[a-z0-9]){5,}@g(oogle)?mail\.com$/)
    email :string;
    @IsString()
    @Length(8,16)
    @Matches(/^(?=.*[A-Z].*[A-Z])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}$/)
    password:string;
    @IsString()
    @Length(4,12)
    username:string;
}