import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly db: DatabaseService) {}

  async existsByName(restaurantId: string, name: string): Promise<boolean> {
    const result = await this.db.query(
      'SELECT 1 FROM categories WHERE restaurant_id = $1 AND name = $2',
      [restaurantId, name],
    );
    return result.rowCount > 0;
  }

  async existsByNameExcludeId(restaurantId: string, name: string, excludeId: string): Promise<boolean> {
    const result = await this.db.query(
      'SELECT 1 FROM categories WHERE restaurant_id = $1 AND name = $2 AND id != $3',
      [restaurantId, name, excludeId],
    );
    return result.rowCount > 0;
  }

  async create(restaurantId: string, dto: CreateCategoryDto): Promise<any> {
    const data = {
      restaurant_id: restaurantId,
      menu_id: dto.menu_id ?? null,
      name: dto.name,
      description: dto.description ?? null,
      display_order: dto.display_order ?? 0,
      is_active: dto.is_active ?? true,
    };
    return this.db.insert('categories', data);
  }

  async findAndCount(restaurantId: string, query: QueryCategoryDto) {
    const {
      menu_id,
      is_active,
      sort_by = 'display_order',
      order = 'ASC',
      page = 1,
      limit = 10,
    } = query;

    const params: any[] = [restaurantId];
    let sqlConditions = 'WHERE restaurant_id = $1';

    if (menu_id) {
      params.push(menu_id);
      sqlConditions += ` AND menu_id = $${params.length}`;
    }
    if (typeof is_active === 'boolean') {
      params.push(is_active);
      sqlConditions += ` AND is_active = $${params.length}`;
    }

    const countSql = `SELECT COUNT(*)::int AS total FROM categories ${sqlConditions}`;
    const countRes = await this.db.query(countSql, params);
    const total = countRes.rows[0].total;

    const offset = (page - 1) * limit;
    const dataSql = `
      SELECT * FROM categories 
      ${sqlConditions} 
      ORDER BY ${sort_by} ${order} 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, limit, offset];
    const dataRes = await this.db.query(dataSql, dataParams);

    return { data: dataRes.rows, total };
  }

  async findById(id: string): Promise<any | null> {
    return this.db.findOne('categories', { id });
  }

  async update(id: string, data: Partial<UpdateCategoryDto>): Promise<any> {
    // Remove undefined values to avoid SQL errors
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );

    if (Object.keys(cleanData).length === 0) return null;

    return this.db.update('categories', id, cleanData);
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete('categories', id);
  }
}
