import { PrismaService } from '../../../core/prisma.service';
import { CreateCategoryHandler } from '../handlers/create-category.handler';
import { Test } from '@nestjs/testing';
import { CoreModule } from '../../../core/core.module';
import { CqrsModule } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';

describe('Create category', function() {
  let prisma: PrismaService;
  let createCategoryHandler: CreateCategoryHandler;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CoreModule, CqrsModule],
      providers: [CreateCategoryHandler],
    }).compile();
    createCategoryHandler = module.get<CreateCategoryHandler>(
      CreateCategoryHandler,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });
  it('should create category', async function() {
    prisma.category.findUnique = jest.fn().mockResolvedValue(null);
    prisma.category.create = jest.fn().mockResolvedValue({ id: 'created-id', title: 'test' })
    const response = await createCategoryHandler.execute({ title: 'test' });
    expect(response).toMatchObject({ id: 'created-id', title: 'test' })
  });
  it('should create category fail category exist', async function() {
    prisma.category.findUnique = jest.fn().mockResolvedValue({ title: 'test' });
    await createCategoryHandler.execute({ title: 'test' }).catch((err: Error) => {

      expect(err.message).toMatch("there is already on category with this title ")
    });
  });

  it('should create category fail create fail', async function() {
    prisma.category.findUnique = jest.fn().mockResolvedValue(null);
    prisma.category.create = jest.fn().mockRejectedValue(new BadRequestException("create error happened"))
    await createCategoryHandler.execute({ title: 'test' }).catch((err: Error) => {
      expect(err.message).toMatch("create error happened")
    });
  });
});
