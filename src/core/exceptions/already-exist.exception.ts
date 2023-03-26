import { BadRequestException } from '@nestjs/common';

export class AlreadyExistException extends BadRequestException {
  constructor(private readonly entity: string, private readonly field: string) {
    super(`There is already ${entity} exist with this ${field}`);
  }
}
