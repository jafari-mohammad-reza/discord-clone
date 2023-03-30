import {PickType} from '@nestjs/swagger';
import {Category} from '../../core/classTypes/Category';

export class CreateCategoryDto extends PickType(Category, ['title']) {
}
