import { Injectable } from '@nestjs/common';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto, SearchResultItemDto } from './dto/search-result.dto';

@Injectable()
export class SearchService {
  search(query: SearchQueryDto): SearchResultDto {
    // Caso 1: Sin parámetros → SELECT * FROM products
    if (!query.searchword && !query.categoria) {
      return this.getAllProducts();
    }
    
    // Caso 2: Solo categoría → filtrar por categoría
    if (!query.searchword && query.categoria) {
      return this.extractByCategory(query.categoria);
    }
    
    // Caso 3: Solo keyword → búsqueda por palabra
    if (query.searchword && !query.categoria) {
      return this.extractByWord(query.searchword);
    }
    
    // Caso 4: keyword + categoría → búsqueda con prioridad
    if (query.searchword && query.categoria) {
      return this.extractByWordWithCategory(query.searchword, query.categoria);
    }
    
    return this.createEmptyResponse();
  }

  private getAllProducts(): SearchResultDto {
    // TODO: Reemplazar con query a base de datos: SELECT * FROM products
    const results = this.getMockData();
    return this.createSearchResponse(results, '', 'todos');
  }

  private extractByCategory(category: string): SearchResultDto {
    // TODO: Reemplazar con query a base de datos: SELECT * FROM products WHERE category = ?
    const results = this.getMockData().filter(item => 
      item.category_name.toLowerCase() === category.toLowerCase()
    );

    return this.createSearchResponse(results, '', category);
  }

  private extractByWord(word: string): SearchResultDto {
    // TODO: Reemplazar con query a base de datos: SELECT * FROM products WHERE name LIKE ?
    const results = this.getMockData().filter(item => 
      item.name.toLowerCase().includes(word.toLowerCase())
    );

    return this.createSearchResponse(results, word, '');
  }

  private extractByWordWithCategory(word: string, category: string): SearchResultDto {
    // TODO: Reemplazar con query a base de datos: SELECT * FROM products WHERE name LIKE ? ORDER BY CASE WHEN category = ? THEN 1 ELSE 2 END
    const results = this.getMockData().filter(item => 
      item.name.toLowerCase().includes(word.toLowerCase())
    );

    // Si se especifica categoría, ordenar poniendo primero los que coinciden
    if (category !== 'todos') {
      results.sort((a, b) => {
        const aHasCategory = a.category_name.toLowerCase() === category.toLowerCase();
        const bHasCategory = b.category_name.toLowerCase() === category.toLowerCase();
        
        if (aHasCategory && !bHasCategory) return -1;
        if (!aHasCategory && bHasCategory) return 1;
        return 0;
      });
    }

    return this.createSearchResponse(results, word, category);
  }
    // TODO: Funcion que retorna datos ejemplo de la base de datos
  private getMockData(): SearchResultItemDto[] {
    return [
      {
        id: '1',
        category_name: 'bebidas',
        name: 'Coca Cola',
        description: 'Bebida gaseosa refrescante',
        price: 15,
        image_url: 'https://example.com/coca-cola.jpg',
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        category_name: 'comidas',
        name: 'Hamburguesa',
        description: 'Hamburguesa con queso y vegetales',
        price: 45,
        image_url: 'https://example.com/hamburguesa.jpg',
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        category_name: 'bebidas',
        name: 'Jugo de Naranja',
        description: 'Jugo natural de naranja',
        price: 12,
        image_url: 'https://example.com/jugo-naranja.jpg',
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '4',
        category_name: 'postres',
        name: 'Tiramisú',
        description: 'Postre italiano clásico',
        price: 25,
        image_url: 'https://example.com/tiramisu.jpg',
        is_available: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  private createSearchResponse(results: SearchResultItemDto[], searchWord: string, category: string): SearchResultDto {
    const page = 1;
    const limit = 10;
    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / limit);

    const meta = {
      limit,
      current_page: page,
      total_pages: totalPages,
      total_items: totalItems,
      has_next: page < totalPages,
      has_prev: page > 1,
      order_by: 'name',
      sortDirection: 'ASC' as const,
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
