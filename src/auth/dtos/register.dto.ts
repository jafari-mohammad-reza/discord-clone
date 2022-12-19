import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { ApiParam, ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail()
  @Matches(/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/) // only accepts gmail and googlemail  domain
  @ApiProperty({
    type: 'email',
    required: true,
    name: 'email',
  })
  email: string;
  @IsString()
  @Length(4, 12)
  @ApiProperty({
    type: 'string',
    required: true,
    minLength: 4,
    maxLength: 12,
    name: 'username',
  })
  username: string;
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
