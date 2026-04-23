import { Injectable } from '@nestjs/common';
import { CategoryTypesRepository } from './category-types.repository';
import { CategoryTypeResponseDto } from './dto/category-type-response.dto';

@Injectable()
export class CategoryTypesService {

  constructor(private readonly repository: CategoryTypesRepository) {}

  async findAll(): Promise<CategoryTypeResponseDto[]> {
    return this.repository.findAll();
  }
}
