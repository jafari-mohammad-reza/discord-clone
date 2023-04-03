import {Test} from '@nestjs/testing';
import {AppModule} from '../src/app.module';
import {BadRequestException, HttpServer, INestApplication,} from '@nestjs/common';
import {PrismaService} from '../src/core/prisma.service';
import {CoreModule} from '../src/core/core.module';
import * as testRequest from 'supertest';
import {RegisterDto} from '../src/auth/dtos/register.dto';
import {LoginDto} from '../src/auth/dtos/login.dto';
import {hashSync} from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {testApplicationSetup} from './test.utils';

describe('Auth controller api endpoints test', function () {
    let httpServer: HttpServer;
    let prismaMock: PrismaService;
    let app: INestApplication;
    let jwtService: JwtService;
    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [AppModule, CoreModule],
        }).compile();
        app = await testApplicationSetup(module);
        prismaMock = module.get<PrismaService>(PrismaService);
        jwtService = module.get<JwtService>(JwtService);
        httpServer = app.getHttpServer();
    });
    afterAll(async () => {
        await app.close();
    });

    describe('Register', function () {
        const registerEndpoint = '/api/v1/auth/register';
        it('should Register', async function () {
            const bodyUser: RegisterDto = {
                email: 'testemail@gmail.com',
                username: 'Test',
                password: 'Test123$',
            };
            prismaMock.user.findFirst = jest.fn().mockResolvedValue(null);
            prismaMock.user.create = jest.fn().mockResolvedValue(bodyUser);
            const response = await testRequest(httpServer)
                .post(registerEndpoint)
                .send(bodyUser);

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject(bodyUser);
        });
        it('should Register fail invalid input (wrong email)', async function () {
            const bodyUser: RegisterDto = {
                email: 'test@gmail.com',
                username: 'Test',
                password: 'Test123$',
            };

            const response = await testRequest(httpServer)
                .post(registerEndpoint)
                .send(bodyUser);

            expect(response.status).toBe(400);
            expect(response.body.messages[0]).toBe(
                'email must match /^[a-z0-9](\\.?[a-z0-9]){5,}@g(oogle)?mail\\.com$/ regular expression',
            );
        });
        it('should Register fail invalid input (wrong passport)', async function () {
            const bodyUser: RegisterDto = {
                email: 'testemail@gmail.com',
                username: 'Test',
                password: 'test123',
            };
            const response = await testRequest(httpServer)
                .post(registerEndpoint)
                .send(bodyUser);

            expect(response.status).toBe(400);
        });
        it('should Register fail user exist', async function () {
            const bodyUser: RegisterDto = {
                email: 'testemail@gmail.com',
                username: 'Test',
                password: 'Test123$',
            };
            prismaMock.user.findFirst = jest.fn().mockResolvedValue({});
            const response = await testRequest(httpServer)
                .post(registerEndpoint)
                .send(bodyUser);

            expect(response.status).toBe(400);
        });
    });
    describe('Login', function () {
        const loginEndpoint = '/api/v1/auth/login';
        it('should Login', async function () {
            const bodyUser: LoginDto = {
                identifier: 'testemail@gmail.com',
                password: 'Test123$',
            };
            prismaMock.user.findFirst = jest.fn().mockResolvedValue({
                email: 'test@gmail.com',
                IsVerified: true,
                password: hashSync('Test123$', 10),
                lastLoginIpAddress: '127.0.0.1',
            });
            prismaMock.user.update = jest.fn().mockResolvedValue({});
            const response = await testRequest(httpServer)
                .post(loginEndpoint)
                .send(bodyUser);
            expect(response.status).toBe(200);
        });
        it('should Login fail invalid input password', async function () {
            const bodyUser: LoginDto = {
                identifier: 'test@gmail.com',
                password: 'test123',
            };
            prismaMock.user.findFirst = jest.fn().mockResolvedValue({
                email: 'test@gmail.com',
                IsVerified: true,
                password: hashSync('Test123$', 10),
                lastLoginIpAddress: '127.0.0.1',
            });
            prismaMock.user.update = jest.fn().mockResolvedValue({});
            const response = await testRequest(httpServer)
                .post(loginEndpoint)
                .send(bodyUser);
            expect(response.status).toBe(400);
        });
        it('should Login fail user not exist', async function () {
            const bodyUser: LoginDto = {
                identifier: 'test@gmail.com',
                password: 'Test123$',
            };
            prismaMock.user.findFirst = jest.fn().mockResolvedValue(null);
            prismaMock.user.update = jest.fn().mockResolvedValue({});
            const response = await testRequest(httpServer)
                .post(loginEndpoint)
                .send(bodyUser);
            expect(response.status).toBe(404);
        });
        it('should Login fail invalid password', async function () {
            const bodyUser: LoginDto = {
                identifier: 'test@gmail.com',
                password: 'Test123$',
            };
            prismaMock.user.findFirst = jest.fn().mockResolvedValue({
                email: 'test@gmail.com',
                IsVerified: true,
                password: hashSync('Test1234$', 10),
                lastLoginIpAddress: '127.0.0.1',
            });
            prismaMock.user.update = jest.fn().mockResolvedValue({});
            const response = await testRequest(httpServer)
                .post(loginEndpoint)
                .send(bodyUser);
            expect(response.status).toBe(400);
        });
        it('should Login fail user is not verified', async function () {
            const bodyUser: LoginDto = {
                identifier: 'test@gmail.com',
                password: 'Test123$',
            };
            prismaMock.user.findFirst = jest.fn().mockResolvedValue({
                email: 'test@gmail.com',
                IsVerified: false,
                password: hashSync('Test123$', 10),
                lastLoginIpAddress: '127.0.0.1',
            });
            prismaMock.user.update = jest.fn().mockResolvedValue({});
            const response = await testRequest(httpServer)
                .post(loginEndpoint)
                .send(bodyUser);
            expect(response.status).toBe(400);
        });
        it('should Login fail wrong ip', async function () {
            const bodyUser: LoginDto = {
                identifier: 'test@gmail.com',
                password: 'Test123$',
            };
            prismaMock.user.findFirst = jest.fn().mockResolvedValue({
                email: 'test@gmail.com',
                IsVerified: true,
                password: hashSync('Test123$', 10),
                lastLoginIpAddress: '1.1.1.1', // ip is not equal to request ip
            });
            prismaMock.user.update = jest.fn().mockResolvedValue({});
            const response = await testRequest(httpServer)
                .post(loginEndpoint)
                .send(bodyUser);
            expect(response.status).toBe(403);
        });
    });
    describe('Verify account', function () {
        const verifyEndpoint = '/api/v1/auth/verify';

        it('should Login', async function () {
            prismaMock.user.findFirst = jest.fn().mockResolvedValue({
                verificationCode: 123456,
            });
            prismaMock.user.update = jest.fn().mockResolvedValue({});
            const response = await testRequest(httpServer).post(
                `${verifyEndpoint}/123456`,
            );
            expect(response.status).toBe(200);
        });
        it('should Login fail code is not 6 digits', async function () {
            prismaMock.user.findFirst = jest.fn().mockResolvedValue({
                verificationCode: 123456,
            });
            const response = await testRequest(httpServer).post(
                `${verifyEndpoint}/1234567`,
            );
            expect(response.status).toBe(400);
        });
        it('should Login fail user not exist', async function () {
            prismaMock.user.findFirst = jest.fn().mockResolvedValue(null);
            const response = await testRequest(httpServer).post(
                `${verifyEndpoint}/123456`,
            );
            expect(response.status).toBe(404);
        });
    });
    describe('Forgot Password', function () {
        const forgotPasswordEndpoint = '/api/v1/auth/forgot-password';

        it('should send forgot password link', async function () {
            const email = 'testemail@gmail.com';
            const currentDate = new Date();
            prismaMock.user.findUnique = jest.fn().mockResolvedValue({
                email,
                resetPasswordAttempt: 0,
                lastResetPasswordAttempt: currentDate.setDate(
                    currentDate.getDate() - 40,
                ),
            });
            const response = await testRequest(httpServer)
                .post(forgotPasswordEndpoint)
                .send({email});
            expect(response.status).toBe(200);
        });
        it('should fail user not found', async function () {
            const email = 'testemail@gmail.com';

            prismaMock.user.findUnique = jest.fn().mockResolvedValue(null);
            const response = await testRequest(httpServer)
                .post(forgotPasswordEndpoint)
                .send({email});
            expect(response.status).toBe(404);
        });
        it('should fail user has reached maximum reset password attempt', async function () {
            const email = 'testemail@gmail.com';
            const currentDate = new Date();

            prismaMock.user.findUnique = jest.fn().mockResolvedValue({
                email: 'testemail@gmail.com',
                resetPasswordAttempt: 3,
                lastResetPasswordAttempt: currentDate.setDate(
                    currentDate.getDate() - 40,
                ),
            });
            const response = await testRequest(httpServer)
                .post(forgotPasswordEndpoint)
                .send({email});
            expect(response.status).toBe(405);
        });
        it('should fail user has reset password in last 30 days', async function () {
            const email = 'testemail@gmail.com';
            const currentDate = new Date();

            prismaMock.user.findUnique = jest.fn().mockResolvedValue({
                email: 'testemail@gmail.com',
                resetPasswordAttempt: 0,
                lastResetPasswordAttempt: currentDate.setDate(
                    currentDate.getDate() - 20,
                ),
            });
            const response = await testRequest(httpServer)
                .post(forgotPasswordEndpoint)
                .send({email});
            expect(response.status).toBe(405);
        });
    });
    describe('Reset Password', function () {
        const resetPasswordEndpoint = '/api/v1/auth/reset-password';

        it('should reset password', async function () {
            const body = {
                password: 'Test1234$',
            };
            prismaMock.user.findUnique = jest.fn().mockResolvedValue({
                email: 'testmail@gmail.com',
                password: 'Test123$',
            });
            jwtService.verifyAsync = jest
                .fn()
                .mockResolvedValue({email: 'testmail@gmail.com'});
            const response = await testRequest(httpServer)
                .post(`${resetPasswordEndpoint}`)
                .send(body);

            expect(response.status).toBe(200);
        });
        it('should reset password fail invalid token', async function () {
            const body = {
                password: 'Test1234$',
            };
            prismaMock.user.findUnique = jest.fn().mockResolvedValue({
                email: 'testmail@gmail.com',
                password: 'Test123$',
            });
            jwtService.verifyAsync = jest
                .fn()
                .mockRejectedValue(new BadRequestException('Invalid token'));
            const response = await testRequest(httpServer)
                .post(`${resetPasswordEndpoint}?token=hello`)
                .send(body);

            expect(response.status).toBe(400);
        });
        it('should reset password fail user not found', async function () {
            const body = {
                password: 'Test1234$',
            };
            prismaMock.user.findUnique = jest.fn().mockResolvedValue(null);
            jwtService.verifyAsync = jest
                .fn()
                .mockResolvedValue({email: 'testmail@gmail.com'});
            const response = await testRequest(httpServer)
                .post(`${resetPasswordEndpoint}?token=hello`)
                .send(body);

            expect(response.status).toBe(404);
        });
    });
});
