import { Controller, Get, Query, ValidationPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultItemDto } from './dto/search-result.dto';
import { ApiResponse as ApiResponseDto } from '../../common/dto/api-response.dto/api-response.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  userUuid?: string;
}

@ApiTags('Search') 
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  @UseGuards(JwtAuthGuard) // Activa autenticación JWT para esta ruta
  @ApiOperation({ summary: 'Buscar productos', description: 'Permite buscar productos por palabra clave, categoría o ambos.' })
  @ApiResponse({ status: 200, description: 'Lista de productos encontrados', type: ApiResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiQuery({ name: 'searchword', required: false, description: 'Palabra clave para buscar productos' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Categoría para filtrar productos' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados' })
  async search(
    @Query(new ValidationPipe({ transform: true }))
    query: SearchQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseDto<SearchResultItemDto[]>> {
    // Usar el userUuid del guard (header) en lugar del query
    const userUuid = req.userUuid;
    return this.searchService.search(query, userUuid);
  }
}
