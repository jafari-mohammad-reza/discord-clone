import {HttpException, NotFoundException} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {Test} from '@nestjs/testing';
import {Category} from '@prisma/client/generated';
import {CoreModule} from '../../../core/core.module';
import {PrismaService} from '../../../core/prisma.service';
import {GetCategoryHandler} from '../handlers/get-category.handler';

describe('Get category by id', function () {
    let prisma: PrismaService;
    let getCategoryHandler: GetCategoryHandler;
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [CqrsModule, CoreModule],
            providers: [GetCategoryHandler],
        }).compile();
        prisma = module.get<PrismaService>(PrismaService);
        getCategoryHandler = module.get<GetCategoryHandler>(GetCategoryHandler);
    });
    it('should get category successfully.', async function () {
        const category: Category = {
            id: 'test-id',
            title: 'test-title',
        };
        prisma.category.findFirst = jest.fn().mockResolvedValue(category);
        const response = await getCategoryHandler.execute({id: 'test'});
        expect(response).toMatchObject(category);
    });

    it('should get category fail.', async function () {
        prisma.category.findFirst = jest.fn().mockResolvedValue(null);
        await getCategoryHandler
            .execute({id: 'test'})
            .catch((err: HttpException) => {
                expect(err).toBeInstanceOf(NotFoundException);
            });
    });
});
