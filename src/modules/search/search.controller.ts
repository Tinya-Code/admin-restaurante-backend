import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { QuerySearchDto } from './dto/query-search.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiResponse } from '../../common/dto/api-response.dto/api-response.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantMemberGuard } from '../../common/guards/restaurant-member/restaurant-member.guard';
import { CurrentBranch } from '../../common/decorators/branch.decorator';
import { CurrentMenu } from '../../common/decorators/menu.decorator';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantMemberGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar productos y/o categorías por sucursal activa' })
  @SwaggerResponse({ status: 200, description: 'Resultados de búsqueda' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(
    @CurrentBranch() branchId: string,
    @CurrentMenu() menuId: string,
    @Query() query: QuerySearchDto,
  ) {
    if (!query.menu_id && menuId) {
      query.menu_id = menuId;
    }
    const result = await this.searchService.search(branchId, query);
    return new ApiResponse(
      result.data,
      'Resultados de búsqueda obtenidos correctamente',
      result.meta,
    );
  }
}