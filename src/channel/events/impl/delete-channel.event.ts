import { Channel } from '@prisma/client/generated';

export class DeleteChannelEvent {
  constructor(
    public readonly channel: Channel,
    public readonly members?: { email: string }[],
  ) {}
}
