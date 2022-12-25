import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteChannelCommand } from "../impl/delete-channel.command";
import { PrismaService } from "../../../core/prisma.service";
import { GoogleDriveService } from "../../../google-drive/google-drive.service";

@CommandHandler(DeleteChannelCommand)
export class DeleteChannelHandler implements ICommandHandler<DeleteChannelCommand>{
  constructor(private readonly prismaService:PrismaService , private readonly googleDriverService:GoogleDriveService) {
  }
  async execute(command: DeleteChannelCommand): Promise<void> {
    const {id} = command
    await this.prismaService.channel.findFirstOrThrow({where : {id}})
    // TODO rmeve image form cloud
    await this.prismaService.channel.delete({where : {id}})
  }

}