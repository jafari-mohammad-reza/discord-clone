import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/generated';
import { genSaltSync, hashSync } from 'bcrypt';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit  {
  async onModuleInit() {
    await this.$connect();
    this.$use(async (params, next) => {
      if (params.model == 'User') {
        if (
          params.action == 'create' ||
          (params.action == 'update' && params.args.data['password'])
        ) {
          const user = params.args.data;
          const salt = genSaltSync(10);
          user.password = hashSync(user.password, salt);
          params.args.data = user;
        }
      }
      return next(params);
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
  async getUserFromToken(token: string) {
    try {
      const jwtService = new JwtService({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      });
      const { email } = await jwtService.verifyAsync(token);
      if (!email) throw new WsException('Invalid token');
      const user = await this.user.findUnique({
        where: { email },
        select: { id: true, username: true },
      });
      if (!user) throw new WsException('User not found');
      return user;
    } catch (e) {
      console.log(e);
    }
  }
}
