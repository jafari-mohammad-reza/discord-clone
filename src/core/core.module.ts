import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { DropBoxModule } from '../drop-box/drop-box.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';

@Global()
@Module({
  imports: [
    {
      ...JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '7d' },
        }),
      }),
      global: true,
    },
    {
      ...DropBoxModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => ({
          access_token: config.getOrThrow('DROP_BOX_ACCESS_TOKEN'),
        }),
      }),
      global: true,
    },
  ],
  providers: [PrismaService],
  exports: [JwtModule, PrismaService],
})
export class CoreModule {}
