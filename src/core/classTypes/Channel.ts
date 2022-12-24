import { Channel as ChannelType } from '@prisma/client/generated';

export class Channel implements ChannelType {
  id: string;
  isPublic: boolean;
  ownerId: string;
  categoryId: string;
  title: string;
}
