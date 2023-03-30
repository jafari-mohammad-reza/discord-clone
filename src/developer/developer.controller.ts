import {BadRequestException, Controller, Get, InternalServerErrorException, Param,} from '@nestjs/common';
import {ApiParam, ApiTags} from '@nestjs/swagger';
import {SearchService} from '../search/search.service';
import {PrismaService} from '../core/prisma.service';

@Controller({
    path: 'developer',
    version: '1',
})
@ApiTags('Developer')
export class DeveloperController {
    constructor(
        private readonly searchService: SearchService,
        private readonly prismaService: PrismaService,
    ) {
    }

    @Get('elastic/:index')
    @ApiParam({name: 'index', required: true, type: String})
    async cleanElasticIndex(@Param('index') index: string) {
        try {
            await this.searchService.cleanIndex(index);
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    @Get('prisma/:table')
    @ApiParam({name: 'table', required: true, type: String})
    async cleanPrismaTable(@Param('table') table: string) {
        try {
            await this.prismaService[table].deleteMany();
        } catch (err) {
            throw new BadRequestException('there is no table name this');
        }
    }
}
