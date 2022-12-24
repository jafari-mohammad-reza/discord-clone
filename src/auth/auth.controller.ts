import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from './commands/impl/register.command';
import { RegisterDto } from './dtos/register.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dtos/login.dto';
import { LoginCommand } from './commands/impl/login.command';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { VerifyAccountCommand } from './commands/impl/verify-account.command';
import {
  ForgotPasswordDto,
  SendForgotPasswordDto,
} from './dtos/forgot-password.dto';
import { SendForgotPasswordCommand } from './commands/impl/send-forgotPassword.command';
import { ResetPasswordCommand } from './commands/impl/reset-password.command';
import { ValidateIpCommand } from './commands/impl/validate-ip.command';

@Controller({
  version: '1',
  path: 'auth',
})
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @ApiBody({ type: RegisterDto, required: true })
  @ApiConsumes('application/x-www-form-urlencoded')
  public async register(@Body() { email, username, password }: RegisterDto) {
    try {
      await this.commandBus.execute(
        new RegisterCommand(email, username, password),
      );
      return 'Success.';
    } catch (err) {
      return `Some problem happened while registering err : ${err.message}`;
    }
  }

  @Post('login')
  @ApiBody({ type: LoginDto, required: true })
  @ApiConsumes('application/x-www-form-urlencoded')
  public async login(
    @Body() { identifier, password }: LoginDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const email = await this.commandBus.execute(
        new LoginCommand(identifier, password, ip.split('f:')[1]),
      );
      const token = await this.jwtService.signAsync(
        { email },
        { expiresIn: Date.now() + 1200 },
      );
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: true,
        })
        .send('Logged in successfully.');
    } catch (err) {
      return `Some problem happened while login err : ${err.message}`;
    }
  }

  @Post('verify/:code')
  @ApiParam({ type: 'string', required: true, name: 'code' })
  public async verifyAccount(@Param('code') code: string) {
    try {
      if (code.length - 1 !== 6)
        throw new BadRequestException('Code must be 6 digits');
      await this.commandBus.execute(new VerifyAccountCommand(+code));
      return 'Success.';
    } catch (err) {
      return `Some problem happened while verifying account err : ${err.message}`;
    }
  }

  @Post('forgot-password')
  @ApiBody({ type: SendForgotPasswordDto, required: true })
  @ApiConsumes('application/x-www-form-urlencoded')
  public async forgotPassword(@Body() { email }: SendForgotPasswordDto) {
    try {
      await this.commandBus.execute(new SendForgotPasswordCommand(email));
      return 'Success.';
    } catch (err) {
      return `Some problem happened while verifying account err : ${err.message}`;
    }
  }

  @Post('reset-password')
  @ApiBody({ type: ForgotPasswordDto, required: true })
  @ApiQuery({ type: 'string', required: true, name: 'token' })
  @ApiConsumes('application/x-www-form-urlencoded')
  public async resetPassword(
    @Body() { password }: ForgotPasswordDto,
    @Query('token') token: string,
  ) {
    try {
      const { email } = await this.jwtService.verifyAsync(token, {});
      await this.commandBus.execute(new ResetPasswordCommand(email, password));
      return 'Success.';
    } catch (err) {
      return `Some problem happened while verifying account err : ${err.message}`;
    }
  }

  @Get('validate-ip/:token')
  @ApiParam({ type: 'string', required: true, name: 'token' })
  public async validateIp(@Param('token') token: string, @Ip() userIp: string) {
    try {
      const { email, ip } = await this.jwtService.verifyAsync(token);
      if (userIp.split('f:')[1] !== ip) {
        throw new BadRequestException('Invalid ip address');
      } else {
        await this.commandBus.execute(new ValidateIpCommand(email));
        return 'Ok';
      }
    } catch (err) {
      return `Some problem happened while validating ip  err : ${err.message}`;
    }
  }
}
