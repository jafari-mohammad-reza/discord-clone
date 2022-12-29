import { PrismaService } from '../../../core/prisma.service';
import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreModule } from '../../../core/core.module';
import { hashSync } from 'bcrypt';
import { VerifyAccountHandler } from '../handlers/verify-account.handler';

let verifyAccountHandler: VerifyAccountHandler;
let prisma: PrismaService;
describe('Reset password handler', function () {
  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [CqrsModule, CoreModule],
      providers: [VerifyAccountHandler],
    }).compile();
    verifyAccountHandler =
      testModule.get<VerifyAccountHandler>(VerifyAccountHandler);
    prisma = testModule.get<PrismaService>(PrismaService);
  });
  it('should handler defined', function () {
    expect(verifyAccountHandler).toBeDefined();
  });
  it('should verify account successfully', async function () {
    const code = 123456;
    prisma.user.findFirst = jest.fn().mockResolvedValue({ id: 'ID' });
    prisma.user.update = jest.fn();
    await verifyAccountHandler.execute({ code });
  });
  it('should verify fail user not exist', async function () {
    const code = 123456;
    prisma.user.findFirst = jest.fn().mockResolvedValue(null);
    prisma.user.update = jest.fn();
    const response = await verifyAccountHandler.execute({ code });
    expect(response).toMatch('There is no user with this code');
  });
});
