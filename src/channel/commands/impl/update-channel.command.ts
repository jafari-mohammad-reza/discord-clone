import { UpdateChannelDto } from "../../dtos/update-channel.dto";

export class UpdateChannelCommand {
  constructor(
    public readonly dto: UpdateChannelDto,
    public readonly id: string
  ) {
  }
}
