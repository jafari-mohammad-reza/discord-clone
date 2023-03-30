import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { MailModule } from './mail/mail.module';
import { CoreModule } from './core/core.module';

import { TopicModule } from './topic/topic.module';
import { CategoryModule } from './category/category.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { AuthMiddleware } from './auth/auth.middleware';
import { DeveloperModule } from './developer/developer.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { DirectMessageModule } from './direct-message/direct-message.module';
import { WebSocketExceptionsFilter } from './core/filters/ws-exception.filter';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    ChannelModule,
    MailModule,
    CategoryModule,
    TopicModule,
    DeveloperModule,
    FriendRequestModule,
    DirectMessageModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: WebSocketExceptionsFilter,
    },
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(AuthMiddleware).exclude('/api/v1/auth/(.*)').forRoutes('*');
  }
}
