import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto/pagination-meta.dto';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(
    branchId: string,
    menuId: string,
    dto: CreateCategoryDto,
  ): Promise<any> {
    // 1. Verificar límite del plan para la sucursal actual (branch_within_category_limit)
    const isWithinLimit =
      await this.categoriesRepository.isWithinPlanLimit(branchId);
    if (!isWithinLimit) {
      throw new ForbiddenException(
        'Has alcanzado el límite de categorías de tu plan actual. Actualiza tu plan para añadir más.',
      );
    }

    // 2. Verificar nombre duplicado en el mismo menú (unique_category_name_per_menu)
    const exists = await this.categoriesRepository.existsByName(
      menuId,
      dto.name,
    );
    if (exists) {
      throw new ConflictException(
        'Ya existe una categoría con ese nombre en este menú.',
      );
    }

    return this.categoriesRepository.create(menuId, dto);
  }

  async findAll(menuId: string, query: QueryCategoryDto) {
    const { data, total } = await this.categoriesRepository.findAndCount(
      menuId,
      query,
    );

    const { page = 1, limit = 10 } = query;
    return {
      data,
      meta: new PaginationMetaDto(
        page,
        limit,
        total,
        query.sort_by || 'display_order',
        query.order || 'ASC',
      ),
    };
  }

  /**
   * Busca una categoría por ID y valida que pertenezca a la sucursal activa.
   * La pertenencia se resuelve por la cadena: category → menu → branch,
   * ya que categories NO tiene restaurant_id en el schema SaaS.
   */
  async findOne(branchId: string, id: string): Promise<any> {
    const category = await this.categoriesRepository.findById(id);

    if (!category || category.branch_id !== branchId) {
      throw new NotFoundException(
        'Categoría no encontrada o no pertenece a tu sucursal activa.',
      );
    }

    return category;
  }

  async update(
    branchId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<any> {
    const currentCategory = await this.findOne(branchId, id);

    if (dto.name && dto.name !== currentCategory.name) {
      const isDuplicate =
        await this.categoriesRepository.existsByNameExcludeId(
          currentCategory.menu_id,
          dto.name,
          id,
        );

      if (isDuplicate) {
        throw new ConflictException(
          'Ya existe una categoría con ese nombre en este menú.',
        );
      }
    }

    const updated = await this.categoriesRepository.update(id, dto);
    return updated || currentCategory;
  }

  async remove(branchId: string, id: string): Promise<void> {
    await this.findOne(branchId, id);
    await this.categoriesRepository.delete(id);
  }
}
