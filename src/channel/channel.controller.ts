import { Controller, Delete, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';

@Controller('channel')
@ApiTags('Channel')
export class ChannelController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createChannel() {
    try {
    } catch (err) {
      return err.message;
    }
  }

  @Patch()
  async updateChannel() {
    try {
    } catch (err) {
      return err.message;
    }
  }

  @Delete()
  async removeChannel() {
    try {
    } catch (err) {
      return err.message;
    }
  }
}
