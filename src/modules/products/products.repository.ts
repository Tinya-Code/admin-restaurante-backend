import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(restaurantId: string, data: Partial<Product>): Promise<Product> {
    const payload = {
      restaurant_id: restaurantId,
      ...data,
    };
    return this.db.insert('products', payload);
  }

  async findAndCount(restaurantId: string, queryDto: QueryProductDto) {
    const {
      category_id,
      is_available,
      min_price,
      max_price,
      page = 1,
      limit = 10,
      sort_by = 'display_order',
      order = 'ASC',
    } = queryDto;

    const conditions: string[] = ['p.restaurant_id = $1'];
    const values: any[] = [restaurantId];
    let paramIndex = 2;

    if (category_id) {
      conditions.push(`p.category_id = $${paramIndex}`);
      values.push(category_id);
      paramIndex++;
    }

    if (is_available !== undefined) {
      conditions.push(`p.is_available = $${paramIndex}`);
      values.push(is_available);
      paramIndex++;
    }

    if (min_price !== undefined) {
      conditions.push(`p.price >= $${paramIndex}`);
      values.push(min_price);
      paramIndex++;
    }

    if (max_price !== undefined) {
      conditions.push(`p.price <= $${paramIndex}`);
      values.push(max_price);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const countSql = `SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`;
    const countRes = await this.db.query(countSql, values);
    const total = parseInt(countRes.rows[0].total, 10);

    const offset = (page - 1) * limit;
    const dataSql = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${whereClause}
      ORDER BY p.${sort_by} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [...values, limit, offset];
    const dataRes = await this.db.query<Product>(dataSql, dataParams);

    return { data: dataRes.rows, total };
  }

  async findById(id: string): Promise<Product | null> {
    const sql = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
    `;
    const res = await this.db.query<Product>(sql, [id]);
    return res.rows[0] || null;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    return this.db.update('products', id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete('products', id);
  }

  async isCategoryValidForRestaurant(categoryId: string, restaurantId: string): Promise<boolean> {
    const sql = 'SELECT 1 FROM categories WHERE id = $1 AND restaurant_id = $2';
    const res = await this.db.query(sql, [categoryId, restaurantId]);
    return res.rowCount > 0;
  }

  async reorderBulk(restaurantId: string, updates: Array<{ id: string; display_order: number }>): Promise<void> {
    await this.db.transaction(async (client) => {
      for (const update of updates) {
        await client.query(
          'UPDATE products SET display_order = $1, updated_at = now() WHERE id = $2 AND restaurant_id = $3',
          [update.display_order, update.id, restaurantId],
        );
      }
    });
  }
}
