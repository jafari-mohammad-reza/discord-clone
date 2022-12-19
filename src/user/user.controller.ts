import { Controller, Get } from '@nestjs/common';
@Controller('users')
export class UserController {
  @Get()
  helloUser() {
    return 'Hello userd';
  }
}
