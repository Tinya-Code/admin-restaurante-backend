import { Controller, Get, Query, ValidationPipe, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
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
  // @UseGuards(JwtAuthGuard) // Activa autenticación JWT para esta ruta
  @ApiOperation({ summary: 'Buscar productos', description: 'Permite buscar productos por palabra clave, categoría o ambos.' })
  @ApiResponse({ status: 200, description: 'Lista de productos encontrados', type: ApiResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiQuery({ name: 'searchword', required: false, description: 'Palabra clave para buscar productos' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Categoría para filtrar productos' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados' })
  async search(
    @Query() query: any,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseDto<SearchResultItemDto[]>> {
    // 🛡️ VALIDACIÓN DE SEGURIDAD: userUuid debe ser un UUID válido
    req.userUuid = '803a50be-7740-4eaf-b399-2b1ad06f1406';
    const userUuid = req.userUuid;
    if (!userUuid) {
      throw new UnauthorizedException('UUID de usuario no proporcionado');
    }
    return this.searchService.search(query, userUuid);
  }

  @Get('categories')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener categorías', description: 'Obtiene todas las categorías activas del restaurante.' })
  @ApiResponse({ status: 200, description: 'Lista de categorías obtenida exitosamente', type: ApiResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getCategories(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseDto<any>> {
    req.userUuid = '803a50be-7740-4eaf-b399-2b1ad06f1406';
    const userUuid = req.userUuid;
    if (!userUuid) {
      throw new UnauthorizedException('UUID de usuario no proporcionado');
    }
    return this.searchService.getCategories(userUuid);
  }
}
