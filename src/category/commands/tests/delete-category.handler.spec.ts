import { PrismaService } from '../../../core/prisma.service';
import { DeleteCategoryHandler } from '../handlers/delete-category.handler';
import { Test } from '@nestjs/testing';
import { CoreModule } from '../../../core/core.module';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpException, NotFoundException } from '@nestjs/common';

describe('Delete category', function () {
  let prisma: PrismaService;
  let deleteCategoryHandler: DeleteCategoryHandler;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CoreModule, CqrsModule],
      providers: [DeleteCategoryHandler],
    }).compile();
    deleteCategoryHandler = module.get(DeleteCategoryHandler);
    prisma = module.get<PrismaService>(PrismaService);
  });
  it('should delete category successfully', async function () {
    const category = { id: 'test-id', title: 'test-category' };
    prisma.category.findFirst = jest.fn().mockResolvedValue(category);
    prisma.category.delete = jest.fn().mockResolvedValue(category);
    const response = await deleteCategoryHandler.execute({ id: '1' });
    expect(response).toMatchObject(category);
  });
  it('should delete category fail category not exist', async function () {
    prisma.category.findFirst = jest.fn().mockResolvedValue(null);
    await deleteCategoryHandler
      .execute({ id: '1' })
      .catch((err: HttpException) => {
        expect(err.message).toMatch('Category not found');
        expect(err).toBeInstanceOf(NotFoundException);
      });
  });
});
