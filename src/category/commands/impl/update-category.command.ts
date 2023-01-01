import { UpdateCategoryDto } from '../../dtos/update-category.dto';

export class UpdateCategoryCommand {
  constructor(public readonly id: string, public readonly title: string) { }
}
