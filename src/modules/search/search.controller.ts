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
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantOwnerGuard } from 'src/common/guards/restaurant-owner/restaurant-owner.guard';
import { CurrentRestaurant } from 'src/common/decorators/restaurant.decorator';
import { CurrentMenu } from 'src/common/decorators/menu.decorator';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantOwnerGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar productos y/o categorías' })
  @SwaggerResponse({ status: 200, description: 'Resultados de búsqueda' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(
    @CurrentRestaurant() restaurantId: string,
    @CurrentMenu() menuId: string,
    @Query() query: QuerySearchDto,
  ) {
    if (!query.menu_id && menuId) {
      query.menu_id = menuId;
    }
    const result = await this.searchService.search(restaurantId, query);
    return new ApiResponse(
      result.data,
      'Resultados de búsqueda obtenidos correctamente',
      result.meta,
    );
  }
}