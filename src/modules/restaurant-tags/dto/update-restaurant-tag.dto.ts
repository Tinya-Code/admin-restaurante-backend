import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantTagDto } from './create-restaurant-tag.dto';

export class UpdateRestaurantTagDto extends PartialType(CreateRestaurantTagDto) {}
