import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

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
  ],
  providers: [PrismaService],
  exports: [JwtModule, PrismaService],
})
export class CoreModule {}
