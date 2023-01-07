import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { PrismaService } from "../core/prisma.service";
import { Request } from "express";
import { Channel, User } from "@prisma/client/generated";

@Injectable()
export class ValidOwnerGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const channelId: string =
      request.params["id"] || request.query["channelId"].toString();
    const authUser: User = request["user"];
    if (!channelId) throw new BadRequestException("Please insert channel id");
    return this.prismaService.channel
      .findFirstOrThrow({ where: { id: channelId } })
      .then((result: Channel) => {
        return result.ownerId === authUser.id;
      })
      .catch((err) => {
        return false;
      });
  }
}
