import { PrismaService } from './../prisma.service';
import { Injectable } from "@nestjs/common";
import { RegisterDto } from './dtos/register.dto';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class AuthService {
    constructor(private commandBus:CommandBus){}
    register({email,username,password}:RegisterDto) {

    }
}