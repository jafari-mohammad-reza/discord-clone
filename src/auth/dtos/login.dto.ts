import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    required: true,
    name: 'identifier',
    description: 'your username or password',
  })
  identifier: string; // email or username
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
