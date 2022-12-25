import {
  ConfigurableModuleBuilder,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from "@nestjs/common";
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailModule } from './mail/mail.module';
import { CoreModule } from './core/core.module';

import { TopicModule } from './topic/topic.module';
import { CategoryModule } from './category/category.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { GoogleDriveModule } from './google-drive/google-drive.module';


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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(AuthMiddleware).exclude('/api/v1/auth/(.*)').forRoutes('*');
  }
}
