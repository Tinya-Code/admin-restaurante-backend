import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './entities/product.entity';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto/pagination-meta.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Crear un nuevo producto
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const {
      restaurant_id,
      category_id,
      name,
      description,
      price,
      image,
      is_available = true,
      display_order = 0,
    } = createProductDto;

    // Validar que la categoría existe y pertenece al restaurante
    await this.validateCategory(category_id, restaurant_id);

    // Subir imagen a Cloudinary si existe
    let image_url: string | null = null;
    if (image) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(
          image,
          'products',
        );
        image_url = uploadResult.secure_url;
      } catch (error) {
        throw new BadRequestException(
          `Error al subir imagen: ${error.message}`,
        );
      }
    }

    const query = `
      INSERT INTO products (
        restaurant_id, category_id, name, description,
        price, image_url, is_available, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      restaurant_id,
      category_id,
      name,
      description || null,
      price,
      image_url,
      is_available,
      display_order,
    ];

    try {
      const result = await this.databaseService.query<Product>(query, values);
      return result.rows[0];
    } catch (error) {
      // Si falla la inserción pero ya subimos la imagen, eliminarla
      if (image_url) {
        await this.cloudinaryService.deleteImage(image_url);
      }

      if (error.code === '23514') {
        throw new BadRequestException(
          'El precio debe ser mayor o igual a 0',
        );
      }
      throw error;
    }
  }

  /**
   * Listar productos con filtros y paginación
   */
  async findAll(
    queryDto: QueryProductDto,
  ): Promise<{ data: Product[]; meta: PaginationMetaDto }> {
    const {
      restaurant_id,
      category_id,
      is_available,
      min_price,
      max_price,
      page = 1,
      limit = 10,
      sort_by = 'display_order',
      order = 'ASC',
    } = queryDto;

    // Validar sort_by para evitar SQL injection
    const validSortFields = ['display_order', 'name', 'price', 'created_at'];
    if (!validSortFields.includes(sort_by)) {
      throw new BadRequestException(
        `sort_by debe ser uno de: ${validSortFields.join(', ')}`,
      );
    }

    // Validar order
    if (!['ASC', 'DESC'].includes(order)) {
      throw new BadRequestException('order debe ser ASC o DESC');
    }

    const conditions: string[] = ['p.restaurant_id = $1'];
    const values: any[] = [restaurant_id];
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

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE ${whereClause}
    `;

    const countResult = await this.databaseService.query(countQuery, values);
    const total = parseInt((countResult.rows[0] as { total: string }).total, 10);

    // Data query con ordenamiento seguro
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${whereClause}
      ORDER BY p.${sort_by} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);

    const dataResult = await this.databaseService.query<Product>(dataQuery, values);

    const meta = new PaginationMetaDto(page, limit, total, sort_by, order);

    return {
      data: dataResult.rows,
      meta,
    };
  }

  /**
   * Obtener un producto por ID
   */
  async findOne(id: string): Promise<Product> {
    const query = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
    `;

    const result = await this.databaseService.query<Product>(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return result.rows[0];
  }

  /**
   * Actualizar un producto
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const existingProduct = await this.findOne(id);

    // Validar nueva categoría si se proporciona
    if (updateProductDto.category_id) {
      await this.validateCategory(
        updateProductDto.category_id,
        existingProduct.restaurant_id,
      );
    }

    // Manejar actualización de imagen
    let new_image_url: string | null = null;
    if (updateProductDto.image) {
      try {
        // Subir nueva imagen
        const uploadResult = await this.cloudinaryService.uploadImage(
          updateProductDto.image,
          'products',
        );
        new_image_url = uploadResult.secure_url;

        // Eliminar imagen anterior si existe
        if (existingProduct.image_url) {
          await this.cloudinaryService.deleteImage(existingProduct.image_url);
        }
      } catch (error) {
        throw new BadRequestException(
          `Error al actualizar imagen: ${error.message}`,
        );
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Construir campos dinámicamente
    Object.entries(updateProductDto).forEach(([key, value]) => {
      // Ignorar campos internos
      if (key === 'image' || value === undefined) {
        return;
      }

      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    // Agregar nueva imagen_url si se subió
    if (new_image_url) {
      fields.push(`image_url = $${paramIndex}`);
      values.push(new_image_url);
      paramIndex++;
    }

    if (fields.length === 0) {
      throw new BadRequestException('No hay campos para actualizar');
    }

    fields.push(`updated_at = now()`);

    const query = `
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await this.databaseService.query<Product>(query, values);
      return result.rows[0];
    } catch (error) {
      // Si falla la actualización pero ya subimos imagen, eliminarla
      if (new_image_url) {
        await this.cloudinaryService.deleteImage(new_image_url);
      }

      if (error.code === '23514') {
        throw new BadRequestException(
          'El precio debe ser mayor o igual a 0',
        );
      }
      throw error;
    }
  }

  /**
   * Eliminar un producto (hard delete)
   */
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    // Eliminar imagen de Cloudinary si existe
    if (product.image_url) {
      await this.cloudinaryService.deleteImage(product.image_url);
    }

    const query = 'DELETE FROM products WHERE id = $1';
    await this.databaseService.query(query, [id]);
  }

  /**
   * Soft delete - Deshabilitar producto
   */
  async softRemove(id: string): Promise<Product> {
    return this.update(id, { is_available: false });
  }

  /**
   * Validar que la categoría existe y pertenece al restaurante
   */
  private async validateCategory(
    categoryId: string,
    restaurantId: string,
  ): Promise<void> {
    const query = `
      SELECT id 
      FROM categories 
      WHERE id = $1 AND restaurant_id = $2
    `;
    const result = await this.databaseService.query(query, [categoryId, restaurantId]);

    if (result.rows.length === 0) {
      throw new NotFoundException(
        `Categoría con ID ${categoryId} no encontrada o no pertenece al restaurante`,
      );
    }
  }

  /**
   * Reordenar productos
   */
  async reorder(
    updates: Array<{ id: string; display_order: number }>,
  ): Promise<void> {
    await this.databaseService.transaction(async (client) => {
      for (const update of updates) {
        await client.query(
          'UPDATE products SET display_order = $1, updated_at = now() WHERE id = $2',
          [update.display_order, update.id],
        );
      }
    });
  }
}