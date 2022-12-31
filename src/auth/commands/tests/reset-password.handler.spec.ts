import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreModule } from '../../../core/core.module';
import { ResetPasswordHandler } from '../handlers/reset-password.handler';
import { User } from '../../../core/classTypes/User';
import { PrismaService } from '../../../core/prisma.service';
import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { hashSync } from 'bcrypt';

let resetPasswordHandler: ResetPasswordHandler;
let prisma: PrismaService;
describe('Reset password handler', function () {
  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [CqrsModule, CoreModule],
      providers: [ResetPasswordHandler],
    }).compile();
    resetPasswordHandler =
      testModule.get<ResetPasswordHandler>(ResetPasswordHandler);
    prisma = testModule.get<PrismaService>(PrismaService);
  });
  it('should handler defined', function () {
    expect(resetPasswordHandler).toBeDefined();
  });
  it('should reset password successfully', async function () {
    const user = {
      email: 'test@gmail.com',
      password: 'Test1234$',
    };
    prisma.user.findUnique = jest
      .fn()
      .mockResolvedValue({ password: hashSync('Test123$', 10) });
    await resetPasswordHandler.execute(user);
  });
  it('should reset password fail user notfound', async function () {
    const user = {
      email: 'test@gmail.com',
      password: 'Test1234$',
    };
    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    await resetPasswordHandler.execute(user).catch((err: HttpException) => {
      expect(err.message).toMatch('user not found');
      expect(err).toBeInstanceOf(NotFoundException);
    });
  });
  it('should reset password fail passwords are same', async function () {
    const user = {
      email: 'test@gmail.com',
      password: 'Test1234$',
    };
    prisma.user.findUnique = jest
      .fn()
      .mockResolvedValue({ password: hashSync('Test1234$', 10) });
    await resetPasswordHandler.execute(user).catch((err: HttpException) => {
      expect(err.message).toMatch(
        'New password must be different from previous one',
      );
      expect(err).toBeInstanceOf(BadRequestException);
    });
  });
});
