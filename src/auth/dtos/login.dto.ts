import {IsNotEmpty, IsString} from 'class-validator';
import {ApiProperty, PickType} from '@nestjs/swagger';
import {User} from '../../core/classTypes/User';

export class LoginDto extends PickType(User, ['password']) {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: 'string',
        required: true,
        name: 'identifier',
        description: 'your username or password',
    })
    identifier: string; // email or username
}
