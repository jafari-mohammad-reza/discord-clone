import { CreateChannelDto } from '../../dtos/create-channel.dto';

export class CreateChannelCommand {
  constructor(
    public readonly createChannelDto: CreateChannelDto,
    public readonly ownerId: string,
  ) {}
}
