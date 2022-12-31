import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreModule } from '../../../core/core.module';
import { LoginHandler } from '../handlers/login.handler';
import { User } from '../../../core/classTypes/User';
import { PrismaService } from '../../../core/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { hashSync } from 'bcrypt';
import { LoginCommand } from '../impl/login.command';

let loginHandler: LoginHandler;
let prisma: PrismaService;
describe('Login handler', function () {
  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [CqrsModule, CoreModule],
      providers: [LoginHandler],
    }).compile();
    loginHandler = testModule.get<LoginHandler>(LoginHandler);
    prisma = testModule.get<PrismaService>(PrismaService);
  });
  it('should handler defined', function () {
    expect(loginHandler).toBeDefined();
  });
  it('should login successfully', async function () {
    const user = {
      identifier: 'test',
      password: 'Test123$',
      ip: '1.1.1.1',
    };
    prisma.user.findFirst = jest.fn().mockResolvedValue({
      email: 'test@gmail.com',
      IsVerified: true,
      password: hashSync('Test123$', 10),
      lastLoginIpAddress: '1.1.1.1',
    });
    prisma.user.update = jest.fn().mockResolvedValue({});
    const response = await loginHandler.execute(user);
    expect(response).toMatch('test@gmail.com');
  });
  it('should login fail user no exist', async function () {
    const user = {
      identifier: 'test',
      password: 'Test123$',
      ip: '1.1.1.1',
    };
    prisma.user.findFirst = jest.fn().mockResolvedValue(null);
    prisma.user.update = jest.fn().mockResolvedValue({});
    await loginHandler.execute(user).catch((err: HttpException) => {
      expect(err.message).toMatch('Please insert your credentials correctly.');
      expect(err).toBeInstanceOf(NotFoundException);
    });
  });
  it('should fail wrong password', async function () {
    const user = {
      identifier: 'test',
      password: 'Test1234$',
      ip: '1.1.1.1',
    };
    prisma.user.findFirst = jest.fn().mockResolvedValue({
      email: 'test@gmail.com',
      IsVerified: true,
      password: hashSync('Test123$', 10),
      lastLoginIpAddress: '1.1.1.1',
    });
    prisma.user.update = jest.fn().mockResolvedValue({});
    await loginHandler.execute(user).catch((err: HttpException) => {
      expect(err.message).toMatch('Please insert your credentials correctly.');
      expect(err).toBeInstanceOf(BadRequestException);
    });
  });

  it('should fail account is not verified', async function () {
    const user = {
      identifier: 'test',
      password: 'Test123$',
      ip: '1.1.1.1',
    };
    prisma.user.findFirst = jest.fn().mockResolvedValue({
      email: 'test@gmail.com',
      IsVerified: false,
      password: hashSync('Test123$', 10),
      lastLoginIpAddress: '1.1.1.1',
    });
    prisma.user.update = jest.fn().mockResolvedValue({});
    await loginHandler.execute(user).catch((err: HttpException) => {
      expect(err.message).toMatch('Please verify your account first');
      expect(err).toBeInstanceOf(BadRequestException);
    });
  });
  it('should fail wrong ip', async function () {
    const user = {
      identifier: 'test',
      password: 'Test123$',
      ip: '1.1.1.2',
    };
    prisma.user.findFirst = jest.fn().mockResolvedValue({
      email: 'test@gmail.com',
      IsVerified: true,
      password: hashSync('Test123$', 10),
      lastLoginIpAddress: '1.1.1.1',
    });
    prisma.user.update = jest.fn().mockResolvedValue({});
    await loginHandler.execute(user).catch((err: HttpException) => {
      expect(err.message).toMatch(
        'Please verify your self with the email we sent to you',
      );
      expect(err).toBeInstanceOf(ForbiddenException);
    });
  });
});
