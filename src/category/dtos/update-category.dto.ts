import { PartialType } from '@nestjs/swagger';
import { Category } from '../../core/classTypes/Category';

export class UpdateCategoryDto extends PartialType(Category) {}
