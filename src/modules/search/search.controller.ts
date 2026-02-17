import { Controller, Get, Query, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto } from './dto/search-result.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Search') 
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar productos', description: 'Permite buscar productos por palabra clave, categoría o ambos.' })
  @ApiResponse({ status: 200, description: 'Lista de productos encontrados', type: SearchResultDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiQuery({ name: 'searchword', required: false, description: 'Palabra clave para buscar productos' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Categoría para filtrar productos' })
  @ApiQuery({ name: 'id', required: false, description: 'ID del restaurante para filtrar productos' })
  async search(
    @Query(new ValidationPipe({ transform: true }))
    query: SearchQueryDto,
  ): Promise<SearchResultDto> {
    return this.searchService.search(query);
  }
}
