import {
  Injectable,
  NestMiddleware,
  RequestMethod,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token: string =
      req.cookies['token'] ||
      req.headers.authorization?.split('Bearer')[1]?.trim();
    if (!token) throw new UnauthorizedException();
    const { email } = await this.jwtService.verifyAsync(token);
    if (!email) throw new UnauthorizedException();
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: { id:true},
    });
    if (!user) throw new UnauthorizedException();
    req['user'] = user;
    next();
  }
}
