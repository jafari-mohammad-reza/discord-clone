import {Test} from '@nestjs/testing';
import {CqrsModule} from '@nestjs/cqrs';
import {CoreModule} from '../../../core/core.module';
import {RegisterHandler} from '../handlers/register.handler';
import {PrismaService} from '../../../core/prisma.service';
import {BadRequestException, HttpException} from '@nestjs/common';

let registerHandler: RegisterHandler;
let prisma: PrismaService;
describe('Register handler', function () {
    beforeEach(async () => {
        const testModule = await Test.createTestingModule({
            imports: [CqrsModule, CoreModule],
            providers: [RegisterHandler],
        }).compile();
        registerHandler = testModule.get<RegisterHandler>(RegisterHandler);
        prisma = testModule.get<PrismaService>(PrismaService);
    });
    it('should handler defined', function () {
        expect(registerHandler).toBeDefined();
    });
    it('should register successfully', async function () {
        const user = {
            email: 'test@gmail.com',
            username: 'test',
            password: 'Test123$',
        };
        prisma.user.findFirst = jest.fn().mockResolvedValue(null);
        prisma.user.create = jest.fn().mockResolvedValue(user);
        const response = await registerHandler.execute(user);
        expect(response).toMatchObject(user);
    });
    it('register fail user exist', async function () {
        const user = {
            email: 'test@gmail.com',
            username: 'test',
            password: 'Test123$',
        };
        prisma.user.findFirst = jest.fn().mockResolvedValue({});
        prisma.user.create = jest.fn().mockResolvedValue(user);
        await registerHandler.execute(user).catch((err: HttpException) => {
            expect(err.message).toMatch('Invalid username or email.');
            expect(err).toBeInstanceOf(BadRequestException);
        });
    });
});
