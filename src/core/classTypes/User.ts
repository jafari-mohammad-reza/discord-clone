import {User as UserType} from '@prisma/client/generated';
import {IsBoolean, IsEmail, IsIP, IsNumber, IsOptional, IsString, IsUUID, Length, Matches,} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class User implements UserType {
    @IsBoolean()
    @ApiProperty({type: Boolean, required: false})
    IsVerified: boolean;
    @IsEmail()
    @Matches(/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/) // only accepts gmail and googlemail  domain
    @ApiProperty({
        type: 'email',
        required: true,
        name: 'email',
    })
    email: string;
    @IsUUID()
    @IsOptional()
    friendId: string | null;
    id: string;
    @IsIP()
    @IsOptional()
    lastLoginIpAddress: string | null;
    lastResetPasswordAttempt: Date | null;
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
    @IsNumber()
    resetPasswordAttempt: number;
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
    @IsNumber()
    @IsOptional()
    verificationCode: number | null;
    @IsUUID()
    @IsOptional()
    voiceRoomId: string | null;
}
