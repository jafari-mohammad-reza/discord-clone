import {CqrsModule} from '@nestjs/cqrs';
import {Test} from '@nestjs/testing';
import {Category} from '@prisma/client/generated';
import {CoreModule} from '../../..//core/core.module';
import {PrismaService} from '../../../core/prisma.service';
import {UpdateCategoryHandler} from '../handlers/update-Category.handler';
import {HttpException, NotFoundException} from '@nestjs/common';
import {AlreadyExistException} from '../../../core/exceptions/already-exist.exception';

describe('Update category', function () {
    let updateCategoryHanlder: UpdateCategoryHandler;
    let prisma: PrismaService;
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [CoreModule, CqrsModule],
            providers: [UpdateCategoryHandler],
        }).compile();
        updateCategoryHanlder = module.get<UpdateCategoryHandler>(
            UpdateCategoryHandler,
        );
        prisma = module.get<PrismaService>(PrismaService);
    });
    it('should update successfully', async function () {
        const category: Category = {
            id: 'test-id',
            title: 'test-title',
        };
        prisma.category.findUnique = jest.fn().mockResolvedValue(category);
        prisma.category.findFirst = jest.fn().mockResolvedValue(null);
        prisma.category.update = jest.fn().mockResolvedValue(category);
        const response = await updateCategoryHanlder.execute({
            id: 'test-id',
            title: 'test-title',
        });
        expect(response).toMatchObject(category);
    });
    it('should update fail category not exist', async function () {
        prisma.category.findUnique = jest.fn().mockResolvedValue(null);
        await updateCategoryHanlder
            .execute({
                id: 'test-id',
                title: 'test-title',
            })
            .catch((err: HttpException) => {
                expect(err).toBeInstanceOf(NotFoundException);
            });
    });
    it('should update fail there is already a category with this title', async function () {
        const category: Category = {
            id: 'test-id',
            title: 'test-title',
        };
        prisma.category.findUnique = jest.fn().mockResolvedValue(category);
        prisma.category.findFirst = jest.fn().mockResolvedValue({});
        await updateCategoryHanlder
            .execute({
                id: 'test-id',
                title: 'test-title',
            })
            .catch((err: HttpException) => {
                expect(err).toBeInstanceOf(AlreadyExistException);
            });
    });
});
