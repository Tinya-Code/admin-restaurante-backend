import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly db: DatabaseService) {}

  async existsByName(menuId: string, name: string): Promise<boolean> {
    const result = await this.db.query(
      'SELECT 1 FROM categories WHERE menu_id = $1 AND name = $2',
      [menuId, name],
    );
    return result.rowCount > 0;
  }

  async existsByNameExcludeId(
    menuId: string,
    name: string,
    excludeId: string,
  ): Promise<boolean> {
    const result = await this.db.query(
      'SELECT 1 FROM categories WHERE menu_id = $1 AND name = $2 AND id != $3',
      [menuId, name, excludeId],
    );
    return result.rowCount > 0;
  }

  async create(menuId: string, dto: CreateCategoryDto): Promise<any> {
    const data = {
      menu_id: menuId,
      name: dto.name,
      description: dto.description ?? null,
      display_order: dto.display_order ?? 0,
      is_active: dto.is_active ?? true,
      type_id: dto.type_id ?? null,
    };
    return this.db.insert('categories', data);
  }

  async findAndCount(menuId: string, query: QueryCategoryDto) {
    const {
      is_active,
      type_id,
      sort_by = 'display_order',
      order = 'ASC',
      page = 1,
      limit = 10,
    } = query;

    const params: any[] = [menuId];
    let sqlConditions = 'WHERE c.menu_id = $1';

    if (typeof is_active === 'boolean') {
      params.push(is_active);
      sqlConditions += ` AND c.is_active = $${params.length}`;
    }

    if (type_id) {
      params.push(type_id);
      sqlConditions += ` AND c.type_id = $${params.length}`;
    }

    const countSql = `SELECT COUNT(*)::int AS total FROM categories c ${sqlConditions}`;
    const countRes = await this.db.query(countSql, params);
    const total = countRes.rows[0].total;

    const offset = (page - 1) * limit;
    const dataSql = `
      SELECT c.*, ct.name AS type_name, m.branch_id
      FROM categories c
      LEFT JOIN category_types ct ON ct.id = c.type_id
      JOIN menus m ON m.id = c.menu_id
      ${sqlConditions}
      ORDER BY c.${sort_by} ${order}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, limit, offset];
    const dataRes = await this.db.query(dataSql, dataParams);

    return { data: dataRes.rows, total };
  }

  async findById(id: string): Promise<any | null> {
    const sql = `
      SELECT c.*, ct.name AS type_name, m.branch_id, b.restaurant_id
      FROM categories c
      LEFT JOIN category_types ct ON ct.id = c.type_id
      JOIN menus m ON m.id = c.menu_id
      JOIN branches b ON b.id = m.branch_id
      WHERE c.id = $1
    `;
    const res = await this.db.query(sql, [id]);
    return res.rows[0] || null;
  }

  async update(id: string, data: Partial<UpdateCategoryDto>): Promise<any> {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );

    if (Object.keys(cleanData).length === 0) return null;

    return this.db.update('categories', id, cleanData);
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete('categories', id);
  }

  /**
   * Verifica si la sucursal puede crear una categoría adicional sin superar
   * el límite de su plan actual. Usa la función branch_within_category_limit
   * definida en 03_triggers_plan_limits.sql.
   * Retorna true si hay capacidad disponible o si el límite es NULL (ilimitado).
   */
  async isWithinPlanLimit(branchId: string): Promise<boolean> {
    const sql = 'SELECT branch_within_category_limit($1) AS is_within';
    const res = await this.db.query(sql, [branchId]);
    return res.rows[0]?.is_within ?? true;
  }
}
