import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { UserModule } from './user/user.module';

@Module({
  imports : [UserModule,AuthModule,ChannelModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
