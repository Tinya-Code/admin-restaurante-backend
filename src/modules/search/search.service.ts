import { Injectable } from '@nestjs/common';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto, SearchResultItemDto, PaginationMeta } from './dto/search-result.dto';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SearchService {
  constructor(private readonly databaseService: DatabaseService) {}

  async search(query: SearchQueryDto, userUuid?: string): Promise<SearchResultDto> {
    console.log('🔍 Search request received:', query);
    
    // extraermos page y limit del query
    const page = query.page || 1;
    const limit = query.limit || 10;

    // Caso 1: Sin parámetros de búsqueda → Obtener todos los productos
    if (!query.searchword && !query.categoria) {
      console.log('📋 Case 1: Get all products');
      return await this.getAllProducts(userUuid, page, limit);
    }
    
    // Caso 2: Solo categoría especificada → Filtrar productos por categoría
    if (!query.searchword && query.categoria) {
      console.log('📋 Case 2: Filter by category:', query.categoria);
      return await this.extractByCategory(query.categoria, userUuid, page, limit);
    }
    
    // Caso 3: Solo palabra clave → Buscar productos por nombre
    if (query.searchword && !query.categoria) {
      console.log('📋 Case 3: Search by word:', query.searchword);
      return await this.extractByWord(query.searchword, userUuid, page, limit);
    }
    
    // Caso 4: Palabra clave + categoría → Búsqueda combinada con prioridad
    if (query.searchword && query.categoria) {
      console.log('📋 Case 4: Search by word + category:', query.searchword, query.categoria);
      return await this.extractByWordWithCategory(query.searchword, query.categoria, userUuid, page, limit);
    }
    
    console.log('📋 Case 5: Empty response');
    return this.createEmptyResponse();
  }

  // Caso 1: Obtener todos los productos
  private async getAllProducts(uuid?: string, page: number = 1, limit: number = 10): Promise<SearchResultDto> {
    const offset = (page - 1) * limit;
    
    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE ($1::uuid IS NULL OR p.restaurant_id = $1)
    `;
    
    const countResult = await this.databaseService.query<{total: string}>(countSql, [uuid || null]);
    const totalItems = parseInt(countResult.rows[0].total, 10);
    
    // Data query con paginación
    const sql = `
      SELECT 
        p.id,
        c.name as category_name,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.is_available,
        p.created_at,
        p.updated_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE ($1::uuid IS NULL OR p.restaurant_id = $1)
      ORDER BY p.display_order ASC, p.name ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await this.databaseService.query<SearchResultItemDto>(sql, [uuid || null, limit, offset]);
    return this.createSearchResponse(result.rows as SearchResultItemDto[], '', 'todos', page, limit, totalItems);
  }

  // Caso 2: Filtrar por categoría
  private async extractByCategory(category: string, uuid?: string, page: number = 1, limit: number = 10): Promise<SearchResultDto> {
    const offset = (page - 1) * limit;
    
    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 
        c.name ILIKE $1
        AND ($2::uuid IS NULL OR p.restaurant_id = $2)
    `;
    
    const countResult = await this.databaseService.query<{total: string}>(countSql, [
      `%${category}%`,
      uuid || null
    ]);
    const totalItems = parseInt(countResult.rows[0].total, 10);
    
    // Data query con paginación
    const sql = `
      SELECT 
        p.id,
        c.name as category_name,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.is_available,
        p.created_at,
        p.updated_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 
        c.name ILIKE $1
        AND ($2::uuid IS NULL OR p.restaurant_id = $2)
      ORDER BY p.display_order ASC, p.name ASC
      LIMIT $3 OFFSET $4
    `;

    const result = await this.databaseService.query<SearchResultItemDto>(sql, [
      `%${category}%`,       // $1 - búsqueda parcial de categoría
      uuid || null,          // $2 - filtro por restaurante (opcional)
      limit,                 // $3 - límite de resultados
      offset                 // $4 - offset para paginación
    ]);
    return this.createSearchResponse(result.rows, '', category, page, limit, totalItems);
  }

  // Caso 3: Búsqueda por palabra clave
  private async extractByWord(word: string, uuid?: string, page: number = 1, limit: number = 10): Promise<SearchResultDto> {
    const offset = (page - 1) * limit;
    
    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 
        p.name ILIKE $1
        AND ($2::uuid IS NULL OR p.restaurant_id = $2)
    `;
    
    const countResult = await this.databaseService.query<{total: string}>(countSql, [
      `%${word}%`,
      uuid || null
    ]);
    const totalItems = parseInt(countResult.rows[0].total, 10);
    
    // Data query con paginación
    const sql = `
      SELECT 
        p.id,
        c.name as category_name,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.is_available,
        p.created_at,
        p.updated_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 
        p.name ILIKE $1
        AND ($2::uuid IS NULL OR p.restaurant_id = $2)
      ORDER BY 
        CASE 
          WHEN p.name ILIKE $3 THEN 1  -- Coincidencia exacta del producto
          WHEN p.name ILIKE $4 THEN 2  -- Producto que empieza con la palabra
          ELSE 3                       -- Producto que contiene la palabra
        END,
        p.display_order ASC,
        p.name ASC
      LIMIT $5 OFFSET $6
    `;

    const result = await this.databaseService.query<SearchResultItemDto>(sql, [
      `%${word}%`,           // $1 - búsqueda parcial del producto
      uuid || null,          // $2 - filtro por restaurante (opcional)
      word,                  // $3 - coincidencia exacta del producto
      `${word}%`,            // $4 - producto que empieza con la palabra
      limit,                 // $5 - límite de resultados
      offset                 // $6 - offset para paginación
    ]);
    return this.createSearchResponse(result.rows, word, '', page, limit, totalItems);
  }

  // Caso 4: Búsqueda por palabra + categoría (con prioridad)
  private async extractByWordWithCategory(word: string, category: string, uuid?: string, page: number = 1, limit: number = 10): Promise<SearchResultDto> {
    const offset = (page - 1) * limit;
    
    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 
        p.name ILIKE $1
        AND c.name ILIKE $2
        AND ($3::uuid IS NULL OR p.restaurant_id = $3)
    `;
    
    const countResult = await this.databaseService.query<{total: string}>(countSql, [
      `%${word}%`,
      `%${category}%`,
      uuid || null
    ]);
    const totalItems = parseInt(countResult.rows[0].total, 10);
    
    // Data query con paginación
    const sql = `
      SELECT 
        p.id,
        c.name as category_name,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.is_available,
        p.created_at,
        p.updated_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 
        p.name ILIKE $1
        AND c.name ILIKE $2
        AND ($3::uuid IS NULL OR p.restaurant_id = $3)
      ORDER BY 
        CASE 
          WHEN c.name ILIKE $4 THEN 1  -- Prioridad: categoría coincide exacto
          ELSE 2                       -- Categoría coincide parcialmente
        END,
        CASE 
          WHEN p.name ILIKE $5 THEN 1  -- Prioridad: producto coincide exacto
          WHEN p.name ILIKE $6 THEN 2  -- Producto empieza con la palabra
          ELSE 3                       -- Producto contiene la palabra
        END,
        p.display_order ASC,
        p.name ASC
      LIMIT $7 OFFSET $8
    `;

    const result = await this.databaseService.query<SearchResultItemDto>(sql, [
        `%${word}%`,           // $1 - búsqueda parcial del producto
        `%${category}%`,       // $2 - búsqueda parcial de la categoría
        uuid || null,          // $3 - filtro por restaurante (opcional)
        category,              // $4 - coincidencia exacta de categoría
        word,                  // $5 - coincidencia exacta del producto
        `${word}%`,            // $6 - producto que empieza con la palabra
        limit,                 // $7 - límite de resultados
        offset                 // $8 - offset para paginación
      ]);
      return this.createSearchResponse(result.rows, word, category, page, limit, totalItems);
  }

  // Métodos auxiliares para crear respuestas
  private createSearchResponse(
    results: SearchResultItemDto[], 
    searchWord: string, 
    category: string, 
    page: number = 1, 
    limit: number = 10, 
    totalItems?: number
  ): SearchResultDto {
    const actualTotalItems = totalItems !== undefined ? totalItems : results.length;
    const totalPages = Math.ceil(actualTotalItems / limit);

    const meta: PaginationMeta = {
      limit,
      current_page: page,
      total_pages: totalPages,
      total_items: actualTotalItems,
      has_next: page < totalPages,
      has_prev: page > 1,
      order_by: 'name',
      sortDirection: 'ASC',
    };

    return {
      status: 'success',
      code: 200,
      data: results,
      meta,
      error: '',
    };
  }

  private createEmptyResponse(): SearchResultDto {
    return {
      status: 'success',
      code: 200,
      data: [],
      meta: null,
      error: '',
    };
  }
}
