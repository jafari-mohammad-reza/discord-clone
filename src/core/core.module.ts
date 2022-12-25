import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { GoogleDriveModule } from "../google-drive/google-drive.module";

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
      ...GoogleDriveModule.registerAsync({
        imports: [ConfigModule],
        inject:[ConfigService],
        useFactory : async (configService:ConfigService) => ({

          token_url:configService.getOrThrow("GOOGLE_DRIVE_TOKEN_URI"),
          project_id:configService.getOrThrow("GOOGLE_DRIVE_PROJECT_ID"),
          client_secret:configService.getOrThrow("GOOGLE_DRIVE_CLIENT_SECRET"),
          client_id:configService.getOrThrow("GOOGLE_DRIVE_CLIENT_ID"),
          auth_url:configService.getOrThrow("GOOGLE_DRIVE_AUTH_URI"),
          auth_provider_cert:configService.getOrThrow("GOOGLE_DRIVE_AUTH_PROVIDER_CERT"),
          client_email:configService.getOrThrow("GOOGLE_DRIVE_CLIENT_EMAIL"),
          private_key:configService.getOrThrow("GOOGLE_DRIVE_PRIVATE_KEY"),
          private_key_id:configService.getOrThrow("GOOGLE_DRIVE_PRIVATE_KEY_ID"),
        })
      }),
      global:true
    }
  ],
  providers: [PrismaService],
  exports: [JwtModule, PrismaService],
})
export class CoreModule {}
