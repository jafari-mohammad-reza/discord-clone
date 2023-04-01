import {PartialType, PickType} from '@nestjs/swagger';
import {Category} from '../../core/classTypes/Category';

export class UpdateCategoryDto extends PickType(PartialType(Category), [
    'title',
]) {
}
