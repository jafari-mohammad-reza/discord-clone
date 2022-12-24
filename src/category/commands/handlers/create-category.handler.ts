import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from '../impl/create-category.command';
import { PrismaService } from '../../../core/prisma.service';
import { compare } from 'bcrypt';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client/generated';
import ChannelCreateOrConnectWithoutCategoryInput = Prisma.ChannelCreateOrConnectWithoutCategoryInput;

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand>
{
  constructor(private readonly prismaService: PrismaService) {}
  async execute(command: CreateCategoryCommand) {
    const { title } = command.createCategoryDto;
    if (
      await this.prismaService.category.findUnique({
        where: { title: title.trim() },
      })
    )
      throw new BadRequestException(
        'there is already on category with this title ',
      );
    return await this.prismaService.category
      .create({
        data: { title },
      })
      .catch((err) => {
        throw new InternalServerErrorException(err.message);
      });
  }
}
