import { CreateChannelDto } from "../../dtos/create-channel.dto";
import { UpdateChannelDto } from "../../dtos/update-channel.dto";

export class UpdateChannelCommand {
  constructor(public readonly updateChannelDto:UpdateChannelDto,public readonly id:string) {
  }
}