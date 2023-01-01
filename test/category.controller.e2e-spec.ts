import { ConsoleLogger, HttpException, HttpServer, INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "../src/app.module";
import { CoreModule } from "../src/core/core.module";
import { Category } from "../src/core/classTypes/Category";
import { PrismaService } from "../src/core/prisma.service"
import * as testRequest from 'supertest'
import { log } from "console";
import { CreateCategoryDto } from "../src/category/dtos/create-category.dto";
import { AlreadyExistException } from "../src/core/exceptions/already-exist.exception";
import { UpdateCategoryDto } from "../src/category/dtos/update-category.dto";
describe('Category controller', function() {
  let httpServer: HttpServer;
  let prismaMock: PrismaService;
  let app: INestApplication;
  let jwtService: JwtService;
  let categoriesAPiEndpoint = '/api/v1/categories'
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, CoreModule],
    }).compile();
    app = await module.createNestApplication();
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
    jwtService = module.get<JwtService>(JwtService);
    httpServer = app.getHttpServer();
  });
  afterAll(async () => {
    await app.close();
  });
  describe('Get categories', function() {
    it('should return a list of categories', async function() {
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findMany = jest.fn().mockResolvedValue([new Category()])
      const response = await testRequest(httpServer).get(categoriesAPiEndpoint).set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(200)
      expect(response.body.length).toBeGreaterThan(0)
    })
    it('should return a list of categories with limited amount', async function() {
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findMany = jest.fn().mockResolvedValue([new Category()])
      const response = await testRequest(httpServer).get(categoriesAPiEndpoint + '?take=20&page=1').set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(200)
      expect(response.body.length).toBeLessThan(20)
    })
    it('should return a empty list of categories', async function() {

      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findMany = jest.fn().mockResolvedValue([])
      const response = await testRequest(httpServer).get(categoriesAPiEndpoint).set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(200)
      expect(response.body.length).toEqual(0)
    })
    it('should return unauthorized exception', async function() {
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: 'testmail@gmail.com' })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue(null)
      prismaMock.category.findMany = jest.fn().mockResolvedValue(null)
      const response = await testRequest(httpServer).get(categoriesAPiEndpoint).set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(401)
    })
  })
  describe('Get category by id', function() {
    it('get category successfully.', async function() {
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findFirst = jest.fn().mockResolvedValue({ id: 'test-id', title: 'test-title' })
      const response = await testRequest(httpServer).get(categoriesAPiEndpoint + '/test-id').set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(200)
      expect(response.body).toBeDefined()
    })
    it('get category return 404.', async function() {
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findFirst = jest.fn().mockResolvedValue(null)
      const response = await testRequest(httpServer).get(categoriesAPiEndpoint + '/test-id').set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(404)
    })

    it('get category return 401.', async function() {
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue(null)
      prismaMock.category.findFirst = jest.fn().mockResolvedValue(null)
      const response = await testRequest(httpServer).get(categoriesAPiEndpoint + '/test-id').set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(401)
    })
  })

  describe('Create category', function() {
    it('cretae category successfully.', async function() {
      const category: CreateCategoryDto = {
        title: "test-category"
      }
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findUnique = jest.fn().mockResolvedValue(null)
      prismaMock.category.create = jest.fn().mockResolvedValue(category)
      const response = await testRequest(httpServer).post(categoriesAPiEndpoint).send(category).set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(201)
    })
    it('create category fail invalid input.', async function() {
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findUnique = jest.fn().mockResolvedValue(null)
      const response = await testRequest(httpServer).post(categoriesAPiEndpoint).send({ id: 'test' }).set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(400)
    })

    it('create category fail exist category.', async function() {
      const category: CreateCategoryDto = {
        title: "test-category"
      }
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findUnique = jest.fn().mockResolvedValue({})
      await testRequest(httpServer).post(categoriesAPiEndpoint).send(category).set("Cookie", `token=${testTokenCookie}`).catch((err: HttpException) => {
        expect(err.getStatus()).toBe(400)
        expect(err).toBeInstanceOf(AlreadyExistException)
      })
    })
  })
  describe('Update category', function() {
    it('update category successfully.', async function() {
      const category: UpdateCategoryDto = {
        title: 'test-category-update'
      }
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findFirst = jest.fn().mockResolvedValue(null)
      prismaMock.category.update = jest.fn().mockResolvedValue(category)
      const response = await testRequest(httpServer).patch(categoriesAPiEndpoint + '/category-id').send(category).set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(200)
    })
    it('update category fail invalid input.', async function() {
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      const response = await testRequest(httpServer).patch(categoriesAPiEndpoint + '/category-id').send({ wrongInput: 'test' }).set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(400)
    })
    it('create category fail exist category.', async function() {
      const category: UpdateCategoryDto = {
        title: "test-category"
      }
      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findFirst = jest.fn().mockResolvedValue({})
      await testRequest(httpServer).patch(categoriesAPiEndpoint + '/category-id').send(category).set("Cookie", `token=${testTokenCookie}`).catch((err: HttpException) => {
        expect(err.getStatus()).toBe(400)
        expect(err).toBeInstanceOf(AlreadyExistException)
      })
    })
  })
  describe('Delete category', function() {
    it('should delete category successfully.', async function() {

      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findFirst = jest.fn().mockResolvedValue({})
      prismaMock.category.delete = jest.fn().mockResolvedValue({})
      const response = await testRequest(httpServer).delete(categoriesAPiEndpoint + '/category-id').set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(200)
    })
    it('should delete category return 404.', async function() {

      const testTokenCookie = await jwtService.signAsync({ email: 'testmail@gmail.com' })
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ email: "testmail@gmail.com" })
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({})
      prismaMock.category.findFirst = jest.fn().mockResolvedValue(null)
      const response = await testRequest(httpServer).delete(categoriesAPiEndpoint + '/category-id').set("Cookie", `token=${testTokenCookie}`)
      expect(response.status).toBe(404)
    })
  })
})
