import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: Partial<Product>): Promise<Product> {
    return this.db.insert('products', data);
  }

  async findAndCount(branchId: string, queryDto: QueryProductDto) {
    const {
      category_id,
      is_available,
      min_price,
      max_price,
      page = 1,
      limit = 10,
      sort_by = 'name',
      order = 'ASC',
    } = queryDto;

    // Filtro directo por branch_id de la tabla products (columna desnormalizada)
    const conditions: string[] = ['p.branch_id = $1'];
    const values: any[] = [branchId];
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

    // COUNT sin JOIN innecesario a menus/branches
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE ${whereClause}
    `;
    const countRes = await this.db.query(countSql, values);
    const total = parseInt(countRes.rows[0].total, 10);

    const offset = (page - 1) * limit;
    const dataSql = `
      SELECT
        p.id, p.branch_id, p.category_id, p.name, p.description,
        p.price, p.image_url, p.cloudinary_id, p.is_available,
        p.is_recommended, p.created_at, p.updated_at,
        c.name AS category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
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
        p.id, p.branch_id, p.category_id, p.name, p.description,
        p.price, p.image_url, p.cloudinary_id, p.is_available,
        p.is_recommended, p.created_at, p.updated_at,
        c.name AS category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
    `;
    const res = await this.db.query<Product>(sql, [id]);
    return res.rows[0] || null;
  }

  /**
   * Busca un producto por ID y verifica que pertenece a la sucursal indicada.
   * Usado para autorización en findOne / update / remove.
   */
  async findByIdAndBranch(id: string, branchId: string): Promise<Product | null> {
    const sql = `
      SELECT
        p.id, p.branch_id, p.category_id, p.name, p.description,
        p.price, p.image_url, p.cloudinary_id, p.is_available,
        p.is_recommended, p.created_at, p.updated_at,
        c.name AS category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1 AND p.branch_id = $2
    `;
    const res = await this.db.query<Product>(sql, [id, branchId]);
    return res.rows[0] || null;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    return this.db.update('products', id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete('products', id);
  }

  /**
   * Verifica que una categoría pertenece a la sucursal activa (via menu_id).
   * Evita que se creen productos de una sucursal en categorías de otra.
   */
  async isCategoryValidForBranch(categoryId: string, branchId: string): Promise<boolean> {
    const sql = `
      SELECT 1
      FROM categories c
      JOIN menus m ON m.id = c.menu_id
      WHERE c.id = $1 AND m.branch_id = $2
    `;
    const res = await this.db.query(sql, [categoryId, branchId]);
    return res.rowCount > 0;
  }

  /**
   * Pre-verifica el límite de productos del plan antes del INSERT.
   * Llama a la función de Postgres: branch_within_product_limit(branch_id).
   * Si retorna false, el service lanza ForbiddenException antes de intentar el INSERT.
   * El trigger trg_check_product_limit actúa como segunda línea de defensa.
   */
  async isWithinProductLimit(branchId: string): Promise<boolean> {
    const sql = 'SELECT branch_within_product_limit($1) AS is_within';
    const res = await this.db.query(sql, [branchId]);
    return res.rows[0]?.is_within ?? true;
  }
}
