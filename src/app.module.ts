import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { UserModule } from './user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
      }),
    }),
    AuthModule,
    UserModule,
    ChannelModule,
  ],
  controllers: [],
  providers: [],
  exports: [JwtModule],
})
export class AppModule {}
