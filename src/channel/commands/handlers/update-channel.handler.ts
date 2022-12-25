import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateChannelCommand } from "../impl/update-channel.command";
import { UpdateChannelDto } from "../../dtos/update-channel.dto";
import { AlreadyExistException } from "../../../core/exceptions/already-exist.exception";
import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../core/prisma.service";
import { GoogleDriveService } from "../../../google-drive/google-drive.service";

@CommandHandler(UpdateChannelCommand)
export class UpdateChannelHandler implements ICommandHandler<UpdateChannelCommand>{
  constructor(private readonly prismaService:PrismaService , private readonly googleDriverService:GoogleDriveService) {

  }

  async execute(command: UpdateChannelCommand): Promise<void> {
    const {title,categoryId,isPublic} = command.updateChannelDto
    const {id} = command
    if(title){
      if(await this.prismaService.channel.findFirst({where :{title:title.trim()}})) throw new AlreadyExistException('Channel' , 'Title')
    }
    if(categoryId){
      const category =await this.prismaService.category.findUnique({where:{id:categoryId}})
      if(!category) throw new NotFoundException()
    }
    // TODO change logo if exist
    await this.prismaService.channel.update({where:{id}, data : {title,categoryId,isPublic:Boolean(isPublic)}})
  }
}