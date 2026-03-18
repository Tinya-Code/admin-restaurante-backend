import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { buildPaginationMeta } from '../../common/pagination.helper';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(restaurantId: string, dto: CreateCategoryDto): Promise<any> {
    const exists = await this.categoriesRepository.existsByName(
      restaurantId,
      dto.name,
    );

    if (exists) {
      throw new ConflictException(
        'Category with that name already exists for the restaurant',
      );
    }

    return this.categoriesRepository.create(restaurantId, dto);
  }

  async findAll(restaurantId: string, query: QueryCategoryDto) {
    const { data, total } = await this.categoriesRepository.findAndCount(
      restaurantId,
      query,
    );

    const { page = 1, limit = 10 } = query;
    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  async findOne(id: string): Promise<any> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<any> {
    const currentCategory = await this.findOne(id);

    if (dto.name && dto.name !== currentCategory.name) {
      const isDuplicate = await this.categoriesRepository.existsByNameExcludeId(
        currentCategory.restaurant_id,
        dto.name,
        id,
      );

      if (isDuplicate) {
        throw new ConflictException('Category name already in use');
      }
    }

    const updated = await this.categoriesRepository.update(id, dto);
    return updated || currentCategory;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.categoriesRepository.delete(id);
    return { message: 'Category deleted successfully' };
  }
}
