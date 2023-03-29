import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { DropBoxModule } from '../drop-box/drop-box.module';
import { CoreGateway } from './core.gateway';

@Global()
@Module({
  imports: [
    {
      ...ConfigModule.forRoot({ isGlobal: true }),
      global: true,
    },
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
  providers: [PrismaService, CoreGateway],
  exports: [JwtModule, PrismaService],
})
export class CoreModule {}
