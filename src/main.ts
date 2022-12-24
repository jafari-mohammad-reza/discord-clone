import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { default as helmet } from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  const config = new DocumentBuilder()
    .setTitle('Discord Clone')
    .setDescription('Discord Clone API Documentation')
    .setVersion('1')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(3000);
}

bootstrap();
