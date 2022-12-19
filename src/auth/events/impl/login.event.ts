import { User } from '@prisma/client';
import { Prisma } from '@prisma/client/generated';
import UserSelect = Prisma.UserSelect;

export class LoginEvent {
  constructor(public readonly email: string) {}
}
