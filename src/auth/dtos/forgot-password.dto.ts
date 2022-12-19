import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendForgotPasswordDto {
  @IsEmail()
  @Matches(/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/) // only accepts gmail and googlemail  domain
  @ApiProperty({
    type: 'email',
    required: true,
    name: 'email',
  })
  email: string;
}

export class ForgotPasswordDto {
  @IsString()
  @Matches(/^.*(?=.{6,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!&$%? "]).*$/)
  @Length(8, 16)
  @ApiProperty({
    type: 'string',
    required: true,
    minLength: 8,
    maxLength: 16,
    name: 'password',
  })
  password: string;
}
