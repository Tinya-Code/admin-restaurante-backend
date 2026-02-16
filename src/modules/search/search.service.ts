import { Injectable } from '@nestjs/common';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto, SearchResultItemDto, PaginationMeta } from './dto/search-result.dto';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SearchService {
  constructor(private readonly databaseService: DatabaseService) {}

  async search(query: SearchQueryDto): Promise<SearchResultDto> {
    // Caso 1: Sin parámetros de búsqueda → Obtener todos los productos
    if (!query.searchword && !query.categoria) {
      return await this.getAllProducts(query.uuid);
    }
    
    // Caso 2: Solo categoría especificada → Filtrar productos por categoría
    if (!query.searchword && query.categoria) {
      return await this.extractByCategory(query.categoria, query.uuid);
    }
    
    // Caso 3: Solo palabra clave → Buscar productos por nombre
    if (query.searchword && !query.categoria) {
      return await this.extractByWord(query.searchword, query.uuid);
    }
    
    // Caso 4: Palabra clave + categoría → Búsqueda combinada con prioridad
    if (query.searchword && query.categoria) {
      return await this.extractByWordWithCategory(query.searchword, query.categoria, query.uuid);
    }
    
    return this.createEmptyResponse();
  }

  // Caso 1: Obtener todos los productos
  private async getAllProducts(uuid?: string): Promise<SearchResultDto> {
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
    `;

    const result = await this.databaseService.query<SearchResultItemDto>(sql, [uuid || null]);
    return this.createSearchResponse(result.rows, '', 'todos');
  }

  // Caso 2: Filtrar por categoría
  private async extractByCategory(category: string, uuid?: string): Promise<SearchResultDto> {
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
    `;

    const result = await this.databaseService.query<SearchResultItemDto>(sql, [
      `%${category}%`,       // $1 - búsqueda parcial de categoría
      uuid || null           // $2 - filtro por restaurante (opcional)
    ]);
    return this.createSearchResponse(result.rows, '', category);
  }

  // Caso 3: Búsqueda por palabra clave
  private async extractByWord(word: string, uuid?: string): Promise<SearchResultDto> {
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
    `;

    const result = await this.databaseService.query<SearchResultItemDto>(sql, [
      `%${word}%`,           // $1 - búsqueda parcial del producto
      uuid || null,          // $2 - filtro por restaurante (opcional)
      word,                  // $3 - coincidencia exacta del producto
      `${word}%`             // $4 - producto que empieza con la palabra
    ]);
    return this.createSearchResponse(result.rows, word, '');
  }

  // Caso 4: Búsqueda por palabra + categoría (con prioridad)
  private async extractByWordWithCategory(word: string, category: string, uuid?: string): Promise<SearchResultDto> {
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
    `;

    const result = await this.databaseService.query<SearchResultItemDto>(sql, [
      `%${word}%`,           // $1 - búsqueda parcial del producto
      `%${category}%`,       // $2 - búsqueda parcial de la categoría
      uuid || null,          // $3 - filtro por restaurante (opcional)
      category,              // $4 - coincidencia exacta de categoría
      word,                  // $5 - coincidencia exacta del producto
      `${word}%`             // $6 - producto que empieza con la palabra
    ]);
    return this.createSearchResponse(result.rows, word, category);
  }

  // Métodos auxiliares para crear respuestas
  private createSearchResponse(results: SearchResultItemDto[], searchWord: string, category: string): SearchResultDto {
    const page = 1;
    const limit = 10;
    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / limit);

    const meta: PaginationMeta = {
      limit,
      current_page: page,
      total_pages: totalPages,
      total_items: totalItems,
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
