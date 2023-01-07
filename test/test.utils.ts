import { Test, TestingModule } from '@nestjs/testing';
import helmet from 'helmet';
import {
  HttpServer,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { CoreModule } from '../src/core/core.module';
import { PrismaService } from '../src/core/prisma.service';
import { JwtService } from '@nestjs/jwt';

export async function testApplicationSetup(module: TestingModule) {
  let app: INestApplication;
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
  return app;
}
