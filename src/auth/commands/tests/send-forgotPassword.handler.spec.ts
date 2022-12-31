import { SendForgotPasswordHandler } from '../handlers/send-forgotPassword.handler';
import { PrismaService } from '../../../core/prisma.service';
import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreModule } from '../../../core/core.module';
import {
  BadRequestException,
  HttpException,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';

let sendForgotPasswordHandler: SendForgotPasswordHandler;
let prisma: PrismaService;
describe('Reset password handler', function () {
  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [CqrsModule, CoreModule],
      providers: [SendForgotPasswordHandler],
    }).compile();
    sendForgotPasswordHandler = testModule.get<SendForgotPasswordHandler>(
      SendForgotPasswordHandler,
    );
    prisma = testModule.get<PrismaService>(PrismaService);
  });
  it('should sendForgotPasswordHandler defined', function () {
    expect(sendForgotPasswordHandler).toBeDefined();
  });
  it('should send forgot password link successfully', async function () {
    const currentDate = new Date();
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      resetPasswordAttempt: 0,
      lastResetPasswordAttempt: currentDate.setDate(currentDate.getDate() - 40),
    });
    const response = await sendForgotPasswordHandler.execute({
      email: 'test@gmail.com',
    });
  });
  it('should send forgot fail user not found', async function () {
    const currentDate = new Date();
    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    await sendForgotPasswordHandler
      .execute({
        email: 'test@gmail.com',
      })
      .catch((err: HttpException) => {
        expect(err.message).toMatch('user not found');
        expect(err).toBeInstanceOf(NotFoundException);
      });
  });
  it('should send forgot password link fail user reached maximum attempt', async function () {
    const currentDate = new Date();
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      resetPasswordAttempt: 3,
      lastResetPasswordAttempt: currentDate.setDate(currentDate.getDate() - 40),
    });
    await sendForgotPasswordHandler
      .execute({
        email: 'test@gmail.com',
      })
      .catch((err: HttpException) => {
        expect(err.message).toMatch(
          'You are not allowed to change your password',
        );
        expect(err).toBeInstanceOf(MethodNotAllowedException);
      });
  });
  it('should send forgot password link fail user changed password lately', async function () {
    const currentDate = new Date();
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      resetPasswordAttempt: 2,
      lastResetPasswordAttempt: currentDate.setDate(currentDate.getDate() - 20),
    });
    await sendForgotPasswordHandler
      .execute({
        email: 'test@gmail.com',
      })
      .catch((err: HttpException) => {
        expect(err.message).toMatch(
          'You are not allowed to change your password',
        );
        expect(err).toBeInstanceOf(MethodNotAllowedException);
      });
  });
});
