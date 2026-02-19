import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DatabaseService } from '../../database/database.service';
import { QueryCategoryDto } from './dto/query-category.dto';
import { buildPaginationMeta } from '../../common/pagination.helper';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DatabaseService) {}

  private allowedSortBy = ['display_order', 'name', 'created_at'];

  async create(dto: CreateCategoryDto): Promise<any> {
    const exists = await (this.db.query(
      'SELECT 1 FROM categories WHERE restaurant_id=$1 AND name=$2',
      [dto.restaurant_id, dto.name],
    ) as Promise<{ rowCount: number; rows: any[] }>);

    if (exists.rowCount > 0) {
      throw new HttpException(
        'Category with that name already exists for the restaurant',
        HttpStatus.CONFLICT,
      );
    }

    const query = `
      INSERT INTO categories 
      (restaurant_id, menu_id, name, description, display_order, is_active)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *;
    `;

    const values: (string | number | boolean | null)[] = [
      dto.restaurant_id,
      dto.menu_id ?? null,
      dto.name,
      dto.description ?? null,
      dto.display_order ?? 0,
      dto.is_active ?? true,
    ];

    const res = await (this.db.query(query, values) as Promise<{
      rowCount: number;
      rows: any[];
    }>);

    return res.rows[0];
  }

  async findAll(query: QueryCategoryDto) {
    const {
      restaurant_id,
      menu_id,
      is_active,
      sort_by = 'display_order',
      order,
      page = 1,
      limit = 10,
    } = query;

    const sortField = this.allowedSortBy.includes(sort_by)
      ? sort_by
      : 'display_order';
    const sortOrder = order === 'DESC' ? 'DESC' : 'ASC';

    let sql = 'SELECT * FROM categories WHERE restaurant_id=$1';
    const params: any[] = [restaurant_id];

    if (menu_id) {
      params.push(menu_id);
      sql += ` AND menu_id=$${params.length}`;
    }
    if (typeof is_active === 'boolean') {
      params.push(is_active);
      sql += ` AND is_active=$${params.length}`;
    }

    const countRes = await (this.db.query(
      `SELECT COUNT(*)::int AS total FROM (${sql}) AS count_sub`,
      params,
    ) as Promise<{ rowCount: number; rows: Array<{ total: number }> }>);

    const total = countRes.rows[0].total;
    const offset = (page - 1) * limit;

    sql += ` ORDER BY ${sortField} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const data = await (this.db.query(sql, params) as Promise<{
      rowCount: number;
      rows: any[];
    }>);

    return { data: data.rows, meta: buildPaginationMeta(total, page, limit) };
  }

  async findOne(id: string): Promise<any> {
    const res = await (this.db.query('SELECT * FROM categories WHERE id=$1', [
      id,
    ]) as Promise<{ rowCount: number; rows: any[] }>);

    if (res.rowCount === 0) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    return res.rows[0];
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<any> {
    const current = await (this.db.query(
      'SELECT * FROM categories WHERE id=$1',
      [id],
    ) as Promise<{ rowCount: number; rows: any[] }>);

    if (current.rowCount === 0) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    const currentCategory = current.rows[0] as Record<string, any>;

    if (dto.name && dto.name !== currentCategory?.name) {
      const dup = await (this.db.query(
        'SELECT 1 FROM categories WHERE restaurant_id=$1 AND name=$2 AND id!=$3',
        [currentCategory?.restaurant_id, dto.name, id],
      ) as Promise<{ rowCount: number; rows: any[] }>);

      if (dup.rowCount > 0) {
        throw new HttpException(
          'Category name already in use',
          HttpStatus.CONFLICT,
        );
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        fields.push(`${key}=$${idx++}`);
        values.push(value);
      }
    }

    if (fields.length > 0) {
      const query = `UPDATE categories SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx} RETURNING *`;
      values.push(id);
      const res = await this.db.query(query, values) as any;
      return res.rows[0];
    }

    return current.rows[0];
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id); // Lanza error si no existe
    await this.db.query('DELETE FROM categories WHERE id=$1', [id]);
    return { message: 'Category deleted successfully' };
  }
}
