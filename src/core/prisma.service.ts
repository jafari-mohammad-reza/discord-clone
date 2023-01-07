import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client/generated";
import { genSaltSync, hashSync } from "bcrypt";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    this.$use(async (params, next) => {
      if (params.model == "User") {
        if (
          params.action == "create" ||
          (params.action == "update" && params.args.data["password"])
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
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
}
