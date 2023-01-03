import { Channel } from '@prisma/client/generated';

export class  CreateChannelEvent {
  constructor(
    public readonly channel: Channel,
    public readonly file: Express.Multer.File ,
  ) {}
}
