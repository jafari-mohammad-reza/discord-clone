import {
  HttpServer,
  INestApplication,
  UploadedFile,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { PrismaService } from '../src/core/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { CoreModule } from '../src/core/core.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { SearchService } from '../src/search/search.service';
import { SearchModule } from '../src/search/search.module';
import * as superRequest from 'supertest';
import { CreateChannelDto } from 'src/channel/dtos/create-channel.dto';
import { createReadStream } from 'fs';
import { fileMock } from '../src/core/utils/fileMock';
import { populateDependencyGraph } from 'ts-loader/dist/utils';
import { DropBoxService } from '../src/drop-box/drop-box.service';
import { generateKeySync } from 'crypto';
describe('Channel controller', function () {
  let httpServer: HttpServer;
  let prismaMock: PrismaService;
  let app: INestApplication;
  let jwtService: JwtService;
  let searchService: SearchService;
  let dropBoxService: DropBoxService;
  const multerMock = jest.mock('multer', () => {
    const multer = () => ({
      any: () => {
        return (req, res, next) => {
          req.body = { userName: 'testUser' };
          req.files = [
            {
              originalname: 'sample.name',
              mimetype: 'sample.type',
              path: 'sample.url',
              buffer: Buffer.from('whatever'),
            },
          ];
          return next();
        };
      },
    });
    multer.memoryStorage = () => jest.fn();
    return multer;
  });
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
    app = module.createNestApplication();
    app.enableCors({ origin: '*' });
    app.use(
      helmet({
        hsts: true,
        crossOriginEmbedderPolicy: true,
        noSniff: true,
        hidePoweredBy: true,
        xssFilter: true,
      }),
    );
    app.enableVersioning({
      prefix: 'api/v',
      type: VersioningType.URI,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.use(cookieParser());
    await app.init();
    await app.listen(5000);
    prismaMock = module.get<PrismaService>(PrismaService);
    searchService = module.get<SearchService>(SearchService);
    jwtService = module.get<JwtService>(JwtService);
    dropBoxService = module.get<DropBoxService>(DropBoxService);
    httpServer = app.getHttpServer();
  });
  afterAll(async () => {
    await app.close();
  });
  describe('Get channels', () => {
    it('should return list of all channels', async function () {
      const testTokenCookie = await jwtService.signAsync({
        email: 'testmail@gmail.com',
      });
      jwtService.verifyAsync = jest
        .fn()
        .mockResolvedValue({ email: 'testmail@gmail.com' });
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({});
      const response = await superRequest(httpServer)
        .get(baseChannelEndpoint)
        .set('Cookie', `token=${testTokenCookie}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
    it('should return channels that are similar to identifier', async function () {
      const testTokenCookie = await jwtService.signAsync({
        email: 'testmail@gmail.com',
      });
      jwtService.verifyAsync = jest
        .fn()
        .mockResolvedValue({ email: 'testmail@gmail.com' });
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({});
      const response = await superRequest(httpServer)
        .get(baseChannelEndpoint + '?identifier=first')
        .set('Cookie', `token=${testTokenCookie}`);
      expect(response.status).toBe(200);
      expect(response.body['hits']['hits']).toBeDefined();
    });
    it('should return  401', async function () {
      const response = await superRequest(httpServer).get(baseChannelEndpoint);
      expect(response.status).toBe(401);
    });
  });
  describe('Create channel', function () {
    it('should create channel successfully.', async () => {
      const channelDto: CreateChannelDto = {
        categoryId: '8cb0622c-dbac-4e06-a683-43165508d524',
        isPublic: true,
        title: 'test-cannel',
      };
      const testTokenCookie = await jwtService.signAsync({
        email: 'testmail@gmail.com',
      });
      jwtService.verifyAsync = jest
        .fn()
        .mockResolvedValue({ email: 'testmail@gmail.com' });
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({});
      prismaMock.channel.findFirst = jest.fn().mockResolvedValue(null);
      prismaMock.category.findUnique = jest.fn().mockResolvedValue({});
      prismaMock.channel.create = jest.fn().mockResolvedValue({});
      dropBoxService.uploadImage = jest.fn().mockResolvedValue({
        status: 200,
        result: { rev: 'test-rev', path_display: 'path-test' },
      });
      const File = Buffer.from('something');
      const targetCategory = await prismaMock.category.findFirst();
      const response = await superRequest(httpServer)
        .post(baseChannelEndpoint)
        .accept('multipart/form-data')
        .field('title')
        .field('categoryId', targetCategory.id)
        .field('isPublic', true)
        .attach('file', File, { filename: 'file.png' })
        .set('Cookie', `token=${testTokenCookie}`);

      console.log(response.error);
      expect(response.status).toBe(201);
    });
  });
});
