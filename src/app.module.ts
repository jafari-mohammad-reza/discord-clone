import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { CoreModule } from './core/core.module';

import { TopicModule } from './topic/topic.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule,
    AuthModule,
    UserModule,
    ChannelModule,
    MailModule,
    CategoryModule,
    TopicModule,
  ],
  controllers: [],
})
export class AppModule {}
