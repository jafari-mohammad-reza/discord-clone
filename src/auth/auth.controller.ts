import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Ip,
  Param,
  Post,
  Query,
  Res,
  UseInterceptors,
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
import { isJWT, IsJWT } from 'class-validator';

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
  @HttpCode(201)
  @ApiBody({ type: RegisterDto, required: true })
  @ApiConsumes('application/x-www-form-urlencoded')
  public async register(@Body() { email, username, password }: RegisterDto) {
    return await this.commandBus.execute(
      new RegisterCommand(email, username, password),
    );
  }

  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: LoginDto, required: true })
  @ApiConsumes('application/x-www-form-urlencoded')
  public async login(
    @Body() { identifier, password }: LoginDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
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
  }

  @Post('verify/:code')
  @HttpCode(200)
  @ApiParam({ type: 'string', required: true, name: 'code' })
  public async verifyAccount(@Param('code') code: string) {
    if (code.length !== 6)
      throw new BadRequestException('Code must be 6 digits');
    await this.commandBus.execute(new VerifyAccountCommand(+code));
    return 'Success.';
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiBody({ type: SendForgotPasswordDto, required: true })
  @ApiConsumes('application/x-www-form-urlencoded')
  public async forgotPassword(@Body() { email }: SendForgotPasswordDto) {
    await this.commandBus.execute(new SendForgotPasswordCommand(email));
    return 'Success.';
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiBody({ type: ForgotPasswordDto, required: true })
  @ApiQuery({ type: 'string', required: true, name: 'token' })
  @ApiConsumes('application/x-www-form-urlencoded')
  public async resetPassword(
    @Body() { password }: ForgotPasswordDto,
    @Query('token') token: string,
  ) {
    if (isJWT(token))
      throw new BadRequestException('please insert a valid jwt token');
    const { email } = await this.jwtService
      .verifyAsync(token, {})
      .catch((err) => {
        throw new BadRequestException(
          err.message === 'jwt malformed' ? 'Invalid token' : err.message,
        );
      });
    await this.commandBus.execute(new ResetPasswordCommand(email, password));
    return 'Success.';
  }

  @Get('validate-ip/:token')
  @HttpCode(200)
  @ApiParam({ type: 'string', required: true, name: 'token' })
  public async validateIp(@Param('token') token: string, @Ip() userIp: string) {
    const { email, ip } = await this.jwtService.verifyAsync(token);
    if (userIp.split('f:')[1] !== ip) {
      throw new BadRequestException('Invalid ip address');
    } else {
      await this.commandBus.execute(new ValidateIpCommand(email));
      return 'Ok';
    }
  }
}
