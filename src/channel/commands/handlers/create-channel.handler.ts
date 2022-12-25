import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateChannelCommand } from "../impl/create-channel.command";
import { PrismaService } from "../../../core/prisma.service";
import { GoogleDriveService } from "../../../google-drive/google-drive.service";
import { AlreadyExistException } from "../../../core/exceptions/already-exist.exception";
import { NotFoundException } from "@nestjs/common";

@CommandHandler(CreateChannelCommand)
export class CreateChannelHandler implements ICommandHandler<CreateChannelCommand>{
  constructor(private readonly prismaService:PrismaService,private readonly googleDriveService:GoogleDriveService) {
  }
  async execute(command: CreateChannelCommand): Promise<void> {
    const {title,categoryId,file,isPublic} = command.createChannelDto
    const { ownerId } = command
    if(await this.prismaService.channel.findFirst({where :{title:title.trim()}})) throw new AlreadyExistException('Channel' , 'Title')
    const category =await this.prismaService.category.findUnique({where:{id:categoryId}})
    if(!category) throw new NotFoundException()
    // const logo = await this.googleDriveService.upload('channel',file)
    await this.prismaService.channel.create({data :{title,categoryId,ownerId,isPublic:Boolean(isPublic)}})

  }
}