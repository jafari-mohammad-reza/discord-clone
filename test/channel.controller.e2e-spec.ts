import {HttpServer, INestApplication} from '@nestjs/common';
import {PrismaService} from '../src/core/prisma.service';
import {JwtService} from '@nestjs/jwt';
import {Test} from '@nestjs/testing';
import {AppModule} from '../src/app.module';
import {CoreModule} from '../src/core/core.module';
import {SearchService} from '../src/search/search.service';
import {SearchModule} from '../src/search/search.module';
import * as superRequest from 'supertest';
import {DropBoxService} from '../src/drop-box/drop-box.service';
import {EventBus} from '@nestjs/cqrs';
import {Category} from '@prisma/client/generated';
import {fileMock} from '../src/core/utils/fileMock';
import {testApplicationSetup} from './test.utils';
import {v4} from 'uuid';

describe('Channel controller', function () {
    let httpServer: HttpServer;
    let prismaMock: PrismaService;
    let app: INestApplication;
    let jwtService: JwtService;
    let searchService: SearchService;
    let dropBoxService: DropBoxService;
    let eventBus: EventBus;
    let baseChannelEndpoint = '/api/v1/channels';
    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                AppModule,
                CoreModule,
                SearchModule.registerAsync({
                    useFactory: async () => ({
                        index: 'channel',
                    }),
                }),
            ],
        }).compile();
        app = await testApplicationSetup(module);
        prismaMock = module.get<PrismaService>(PrismaService);
        searchService = module.get<SearchService>(SearchService);
        jwtService = module.get<JwtService>(JwtService);
        dropBoxService = module.get<DropBoxService>(DropBoxService);
        eventBus = module.get<EventBus>(EventBus);
        httpServer = app.getHttpServer();
    });
    afterAll(async () => {
        await app.close();
    });

    async function authorizeUser() {
        const testTokenCookie = await jwtService.signAsync({
            email: 'testmail@gmail.com',
        });
        jwtService.verifyAsync = jest
            .fn()
            .mockResolvedValue({email: 'testmail@gmail.com'});
        return testTokenCookie;
    }

    describe('Get channels', () => {
        it('should return list of all channels', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest.fn().mockResolvedValue({});
            const response = await superRequest(httpServer)
                .get(baseChannelEndpoint)
                .set('Cookie', `token=${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
        });
        it('should return channels that are similar to identifier', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest.fn().mockResolvedValue({});
            const response = await superRequest(httpServer)
                .get(baseChannelEndpoint + '?identifier=first')
                .set('Cookie', `token=${token}`);
            expect(response.status).toBe(200);
            expect(response.body['hits']['hits']).toBeDefined();
        });
        it('should return  401', async function () {
            const response = await superRequest(httpServer).get(baseChannelEndpoint);
            expect(response.status).toBe(401);
        });
    });
    describe('Create channel', function () {
        async function returnChannelRequirements(): Promise<{
            File: Express.Multer.File;
            channelTitle: string;
            targetCategory: Category;
        }> {
            const File = await fileMock();
            const channelTitle = Math.floor(Math.random() * 100000).toString();
            let targetCategory: Category | undefined;
            targetCategory = await prismaMock.category.findFirst();
            if (!targetCategory) {
                targetCategory = await prismaMock.category.create({
                    data: {title: 'test-category'},
                });
            }
            return {File, channelTitle, targetCategory};
        }

        const baseCreateRequest = (
            channelTitle: string,
            targetCategory: Category,
            File?: Express.Multer.File,
            token?: string,
        ) =>
            superRequest(httpServer)
                .post(baseChannelEndpoint)
                .accept('multipart/form-data')
                .field('title', channelTitle)
                .field('categoryId', targetCategory.id)
                .field('isPublic', true)
                .attach('file', File.buffer, {filename: 'file.png'})
                .set('Cookie', `token=${token}`);
        it('should create channel successfully.', async () => {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest.fn().mockResolvedValue({});
            prismaMock.channel.findFirst = jest.fn().mockResolvedValue(null);
            prismaMock.category.findUnique = jest.fn().mockResolvedValue({});
            prismaMock.channel.create = jest.fn().mockResolvedValue({});
            prismaMock.channel.update = jest.fn().mockResolvedValue({});
            const {File, channelTitle, targetCategory} =
                await returnChannelRequirements();
            const response = await baseCreateRequest(
                channelTitle,
                targetCategory,
                File,
                token,
            );
            expect(response.status).toBe(201);
        });
        it('should create channel fail exist title.', async () => {
            const token = await authorizeUser();

            prismaMock.user.findUnique = jest.fn().mockResolvedValue({});
            prismaMock.channel.findFirst = jest.fn().mockResolvedValue({});

            const {File, channelTitle, targetCategory} =
                await returnChannelRequirements();
            const response = await baseCreateRequest(
                channelTitle,
                targetCategory,
                File,
                token,
            );
            expect(response.status).toBe(400);
        });
        it('should create channel fail wrong category id.', async () => {
            const token = await authorizeUser();

            prismaMock.user.findUnique = jest.fn().mockResolvedValue({});
            prismaMock.channel.findFirst = jest.fn().mockResolvedValue(null);
            prismaMock.category.findUnique = jest.fn().mockResolvedValue(null);
            const {File, channelTitle, targetCategory} =
                await returnChannelRequirements();
            const response = await baseCreateRequest(
                channelTitle,
                targetCategory,
                File,
                token,
            );
            expect(response.status).toBe(404);
        });
        it('should create channel fail user not authorized.', async () => {
            prismaMock.user.findUnique = jest.fn().mockResolvedValue(null);
            const {File, channelTitle, targetCategory} =
                await returnChannelRequirements();
            const response = await baseCreateRequest(
                channelTitle,
                targetCategory,
                File,
            );
            expect(response.status).toBe(401);
        });
    });
    describe('Join channel', function () {
        const baseJoinRequest = async (token: string) =>
            await superRequest(httpServer)
                .post(baseChannelEndpoint + '/join/' + 'channel-id')
                .set('Cookie', `token=${token}`);
        it('should join channel successfully', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'user-id'});
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                isPublic: true,
                ownerId: 'owner-id',
                members: [],
            });
            const response = await baseJoinRequest(token);
            expect(response.status).toBe(200);
        });
        it('should join channel fail channel not exist', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'user-id'});
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue(null);
            const response = await baseJoinRequest(token);
            expect(response.status).toBe(404);
        });
        it('should join channel fail channel is private', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'user-id'});
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                isPublic: false,
                ownerId: 'owner-id',
                members: [],
            });
            const response = await baseJoinRequest(token);
            expect(response.status).toBe(400);
            expect(response.body.messages).toMatch('Channel is not public');
        });
        it('should join channel fail user is the owner', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'user-id'});
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                isPublic: true,
                ownerId: 'user-id',
                members: [],
            });
            const response = await baseJoinRequest(token);
            expect(response.status).toBe(400);
            expect(response.body.messages).toMatch('you are owner');
        });
        it('should join channel fail user is joined in channel', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'user-id'});
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                isPublic: true,
                ownerId: 'owner-id',
                members: [{id: 'user-id'}],
            });
            const response = await baseJoinRequest(token);
            expect(response.status).toBe(400);
            expect(response.body.messages).toMatch('you are already in this channel');
        });
        it('should join channel fail user is not authorized', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest.fn().mockResolvedValue(null);
            const response = await baseJoinRequest(token);
            expect(response.status).toBe(401);
        });
    });

    describe('Leave channel', function () {
        const baseLeaveRequest = async (token: string) =>
            await superRequest(httpServer)
                .post(baseChannelEndpoint + '/leave/' + 'channel-id')
                .set('Cookie', `token=${token}`);
        it('should leave channel successfully', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'user-id'});
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                isPublic: true,
                ownerId: 'owner-id',
                members: [{id: 'user-id'}],
            });
            const response = await baseLeaveRequest(token);
            expect(response.status).toBe(200);
        });
        it('should leave channel fail channel not exist', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'user-id'});
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue(null);
            const response = await baseLeaveRequest(token);
            expect(response.status).toBe(404);
        });
        it('should leave channel fail user is the owner', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'user-id'});
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                isPublic: true,
                ownerId: 'user-id',
                members: [{id: 'user-id'}],
            });
            const response = await baseLeaveRequest(token);
            expect(response.status).toBe(400);
            expect(response.body.messages).toMatch('you are owner you cannot leave');
        });
        it('should leave channel fail user is not joined in channel', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'user-id'});
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                isPublic: true,
                ownerId: 'owner-id',
                members: [{id: 'user-id-2'}],
            });
            const response = await baseLeaveRequest(token);
            expect(response.status).toBe(400);
            expect(response.body.messages).toMatch('you are not in this channel');
        });
        it('should leave channel fail user is not authorized', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest.fn().mockResolvedValue(null);
            const response = await baseLeaveRequest(token);
            expect(response.status).toBe(401);
        });
    });
    describe('kick from channel', function () {
        const baseKickRequest = async (token: string) =>
            await superRequest(httpServer)
                .post(baseChannelEndpoint + '/kick/' + 'user-id?channelId=channel-id')
                .set('Cookie', `token=${token}`);
        it('should kick user successfully.', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'owner-id'});
            prismaMock.channel.findFirstOrThrow = jest.fn().mockResolvedValue({
                id: 'channel-id',
                ownerId: 'owner-id',
            });
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                id: 'channel-id',
                ownerId: 'owner-id',
                members: [{id: 'user-id'}],
            });
            const response = await baseKickRequest(token);
            expect(response.status).toBe(200);
        });
        it('should kick user fail channel not exist in guard.', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'owner-id'});
            prismaMock.channel.findFirstOrThrow = jest.fn().mockResolvedValue(null);
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                id: 'channel-id',
                ownerId: 'owner-id',
                members: [{id: 'user-id'}],
            });
            const response = await baseKickRequest(token);
            expect(response.status).toBe(403);
        });
        it('should kick user fail channel not exist.', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'owner-id'});
            prismaMock.channel.findFirstOrThrow = jest.fn().mockResolvedValue({
                id: 'channel-id',
                ownerId: 'owner-id',
            });
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue(null);
            const response = await baseKickRequest(token);
            expect(response.status).toBe(404);
        });
        it('should kick user fail user is not exist in channel.', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'owner-id'});
            prismaMock.channel.findFirstOrThrow = jest.fn().mockResolvedValue({
                id: 'channel-id',
                ownerId: 'owner-id',
            });
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                id: 'channel-id',
                ownerId: 'owner-id',
                members: [{id: 'user-id-2'}],
            });
            const response = await baseKickRequest(token);
            expect(response.status).toBe(400);
        });
        it('should kick user fail user is not admin in guard.', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'owner-id'});
            prismaMock.channel.findFirstOrThrow = jest.fn().mockResolvedValue({
                id: 'channel-id',
                ownerId: 'owner-id-2',
            });
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                id: 'channel-id',
                ownerId: 'owner-id',
                members: [{id: 'user-id-2'}],
            });
            const response = await baseKickRequest(token);
            expect(response.status).toBe(403);
        });
        it('should kick user fail target user is owner.', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'owner-id'});
            prismaMock.channel.findFirstOrThrow = jest.fn().mockResolvedValue({
                id: 'channel-id',
                ownerId: 'owner-id',
            });
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue({
                id: 'channel-id',
                ownerId: 'owner-id',
                members: [{id: 'user-id'}],
            });
            const response = await superRequest(httpServer)
                .post(baseChannelEndpoint + '/kick/' + 'owner-id?channelId=channel-id')
                .set('Cookie', `token=${token}`);
            expect(response.status).toBe(400);
        });
    });
    describe('update channel', function () {
        async function returnChannelRequirements(): Promise<{
            file: Express.Multer.File;
            channelTitle: string;
        }> {
            const file = await fileMock();
            const channelTitle = Math.floor(Math.random() * 100000).toString();
            return {file, channelTitle};
        }

        const updateChannelBaseRequest = async (
            title?: string,
            categoryId?: string,
            isPublic?: boolean,
            file?: Express.Multer.File,
            token?: string,
        ) =>
            await superRequest(httpServer)
                .patch(baseChannelEndpoint + '/channel-id')
                .accept('multipart/form-data')
                .field('title', title)
                .field('categoryId', categoryId)
                .field('isPublic', isPublic)
                .attach('file', file.buffer, {filename: 'file.png'})
                .set('Cookie', `token=${token}`);

        it('should update channel successfully', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'owner-id'});
            prismaMock.channel.findFirst = jest.fn().mockResolvedValue(null);
            prismaMock.category.findUnique = jest.fn().mockResolvedValue({});
            prismaMock.channel.update = jest.fn().mockResolvedValue(null);
            eventBus.publish = jest.fn();
            const {file, channelTitle} = await returnChannelRequirements();
            const response = await updateChannelBaseRequest(
                channelTitle,
                v4().toString(),
                false,
                file,
                token,
            );
            expect(response.status).toBe(200);
        });
        it('should update channel fail title exist', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'owner-id'});
            prismaMock.channel.findFirst = jest.fn().mockResolvedValue({});
            const {file, channelTitle} = await returnChannelRequirements();
            const response = await updateChannelBaseRequest(
                channelTitle,
                v4().toString(),
                false,
                file,
                token,
            );
            expect(response.status).toBe(400);
        });
        it('should update channel fail category not exist', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'owner-id'});
            prismaMock.channel.findFirst = jest.fn().mockResolvedValue(null);
            prismaMock.category.findUnique = jest.fn().mockResolvedValue(null);
            const {file, channelTitle} = await returnChannelRequirements();
            const response = await updateChannelBaseRequest(
                channelTitle,
                v4().toString(),
                false,
                file,
                token,
            );
            expect(response.status).toBe(404);
        });
        it('should update channel fail wrong owner', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'user-id'});
            prismaMock.channel.findFirst = jest.fn().mockResolvedValue(null);
            prismaMock.category.findUnique = jest.fn().mockResolvedValue({});
            prismaMock.channel.update = jest.fn().mockResolvedValue(null);
            eventBus.publish = jest.fn();
            const {file, channelTitle} = await returnChannelRequirements();
            const response = await updateChannelBaseRequest(
                channelTitle,
                v4().toString(),
                false,
                file,
                token,
            );
            expect(response.status).toBe(403);
        });
    });
    describe('delete channel', function () {
        const deleteChannelBaseRequest = async (token) =>
            await superRequest(httpServer)
                .delete(baseChannelEndpoint + '/channel-id')
                .set('Cookie', `token=${token}`);
        it('should delete channel successfully', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'owner-id'});
            prismaMock.channel.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'channel-id'});
            prismaMock.channel.delete = jest.fn().mockResolvedValue(null);
            eventBus.publish = jest.fn();
            const response = await deleteChannelBaseRequest(token);
            expect(response.status).toBe(200);
        });
        it('should delete channel fail channel not exist', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'owner-id'});
            prismaMock.channel.findUnique = jest.fn().mockResolvedValue(null);
            prismaMock.channel.delete = jest.fn().mockResolvedValue(null);
            eventBus.publish = jest.fn();
            const response = await deleteChannelBaseRequest(token);
            expect(response.status).toBe(404);
        });
        it('should delete channel fail wrong owner', async function () {
            const token = await authorizeUser();
            prismaMock.user.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'user-id'});
            prismaMock.channel.findUnique = jest
                .fn()
                .mockResolvedValue({id: 'channel-id'});
            prismaMock.channel.delete = jest.fn().mockResolvedValue(null);
            eventBus.publish = jest.fn();
            const response = await deleteChannelBaseRequest(token);
            expect(response.status).toBe(403);
        });
    });
});
