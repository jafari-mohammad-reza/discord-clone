import { Controller, Get } from '@nestjs/common';
@Controller()
export class UserController {
    @Get()
    helloUser(){
        return "Hello user"
    }
}