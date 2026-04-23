import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse as ApiResponseDto } from '../../common/dto/api-response.dto/api-response.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantMemberGuard } from '../../common/guards/restaurant-member/restaurant-member.guard';
import { CurrentRestaurant } from '../../common/decorators/restaurant.decorator';
import { RestaurantTagsService } from './restaurant-tags.service';
import { TagResponseDto } from './dto/tag-response.dto';
import { UpdateRestaurantTagsDto } from './dto/update-restaurant-tags.dto';

@ApiTags('restaurant-tags')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantMemberGuard)
@Controller('restaurant-tags')
export class RestaurantTagsController {
  constructor(private readonly restaurantTagsService: RestaurantTagsService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'Obtener catálogo global de etiquetas' })
  @ApiResponse({ status: 200, type: ApiResponseDto<TagResponseDto[]> })
  async getCatalog(): Promise<ApiResponseDto<TagResponseDto[]>> {
    const data = await this.restaurantTagsService.findAllGlobalTags();
    return new ApiResponseDto(data, 'Catálogo de etiquetas obtenido exitosamente');
  }

  @Get()
  @ApiOperation({ summary: 'Obtener etiquetas vinculadas al restaurante actual' })
  @ApiResponse({ status: 200, type: ApiResponseDto<TagResponseDto[]> })
  async getRestaurantTags(
    @CurrentRestaurant() restaurantId: string,
  ): Promise<ApiResponseDto<TagResponseDto[]>> {
    const data = await this.restaurantTagsService.findRestaurantTags(restaurantId);
    return new ApiResponseDto(data, 'Etiquetas del restaurante obtenidas exitosamente');
  }

  @Put()
  @ApiOperation({ summary: 'Sincronizar etiquetas del restaurante actual' })
  @ApiResponse({ status: 200, type: ApiResponseDto<TagResponseDto[]> })
  async syncTags(
    @CurrentRestaurant() restaurantId: string,
    @Body() updateDto: UpdateRestaurantTagsDto,
  ): Promise<ApiResponseDto<TagResponseDto[]>> {
    const data = await this.restaurantTagsService.syncRestaurantTags(restaurantId, updateDto);
    return new ApiResponseDto(data, 'Etiquetas sincronizadas exitosamente');
  }
}
