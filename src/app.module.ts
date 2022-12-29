import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { CoreModule } from './core/core.module';

import { TopicModule } from './topic/topic.module';
import { CategoryModule } from './category/category.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './core/http-exception.filter';

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
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(AuthMiddleware).exclude('/api/v1/auth/(.*)').forRoutes('*');
  }
}
