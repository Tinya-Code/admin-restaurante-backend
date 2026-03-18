import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse as ApiResponseDto } from '../../common/dto/api-response.dto/api-response.dto';
import { CategoriesCountResponseDto } from './dto/categories-count-response.dto';
import { ProductsCountResponseDto } from './dto/products-count-response.dto';
import { RecentProductsResponseDto } from './dto/recent-products-response.dto';
import { StatisticsQueryDto } from './dto/statistics-query.dto';
import { StatisticsService } from './statistics.service';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantOwnerGuard } from 'src/common/guards/restaurant-owner/restaurant-owner.guard';
import { CurrentRestaurant } from 'src/common/decorators/restaurant.decorator';

@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantOwnerGuard)
@Controller('statistics')
export class StatisticsController {
  private readonly logger = new Logger(StatisticsController.name);
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('products/count')
  @ApiOperation({
    summary: 'Get total products count',
    description:
      'Returns the total number of products for the current restaurant',
  })
  @ApiHeader({
    name: 'x-restaurant-id',
    required: false,
    description: 'ID de restaurante opcional para sobrescribir el contexto automático',
  })
  @ApiResponse({
    status: 200,
    description: 'Products count retrieved successfully',
    type: ApiResponseDto<ProductsCountResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
    schema: {
      example: {
        status: 'error',
        code: '400',
        message: 'Validation failed',
        error: {
          code: '400',
          message: 'restaurant_id must be a valid UUID',
          details: {
            field: 'restaurant_id',
            value: 'invalid-uuid',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found',
    schema: {
      example: {
        status: 'error',
        code: '404',
        message: 'Restaurant not found',
        error: {
          code: '404',
          message:
            'No restaurant found for the provided context',
        },
      },
    },
  })
  async getProductsCount(
    @CurrentRestaurant() restaurantId: string,
    @Query() query: StatisticsQueryDto,
  ): Promise<ApiResponseDto<ProductsCountResponseDto>> {
    try {
      this.logger.log(
        `Getting products count for restaurant: ${restaurantId}`,
      );

      const data = await this.statisticsService.getProductsCount(
        restaurantId,
      );

           return new ApiResponseDto(
        data,
        'Products count retrieved successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error getting products count', error);
      throw new HttpException(
        {
          status: 'error',
          code: '500',
          message: 'Internal server error',
          error: {
            code: '500',
            message:
              'An unexpected error occurred while retrieving products count',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('categories/count')
  @ApiOperation({
    summary: 'Get total categories count',
    description:
      'Returns the total number of categories for the current restaurant',
  })
  @ApiHeader({
    name: 'x-restaurant-id',
    required: false,
    description: 'ID de restaurante opcional para sobrescribir el contexto automático',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories count retrieved successfully',
    type: ApiResponseDto<CategoriesCountResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found',
  })
  async getCategoriesCount(
    @CurrentRestaurant() restaurantId: string,
    @Query() query: StatisticsQueryDto,
  ): Promise<ApiResponseDto<CategoriesCountResponseDto>> {
    try {
      this.logger.log(
        `Getting categories count for restaurant: ${restaurantId}`,
      );

      const data = await this.statisticsService.getCategoriesCount(
        restaurantId,
      );

      return new ApiResponseDto(
        data,
        'Categories count retrieved successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error getting categories count', error);
      throw new HttpException(
        {
          status: 'error',
          code: '500',
          message: 'Internal server error',
          error: {
            code: '500',
            message:
              'An unexpected error occurred while retrieving categories count',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('products/recent')
  @ApiOperation({
    summary: 'Get recent products',
    description:
      'Returns the most recent products for the current restaurant, ordered by creation date DESC',
  })
  @ApiHeader({
    name: 'x-restaurant-id',
    required: false,
    description: 'ID de restaurante opcional para sobrescribir el contexto automático',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Maximum number of products to return (default: 5, max: 20)',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Recent products retrieved successfully',
    type: ApiResponseDto<RecentProductsResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format or limit out of range',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found',
  })
  async getRecentProducts(
    @CurrentRestaurant() restaurantId: string,
    @Query() query: StatisticsQueryDto,
  ): Promise<ApiResponseDto<RecentProductsResponseDto>> {
    try {
      this.logger.log(
        `Getting recent products for restaurant: ${restaurantId}, limit: ${query.limit}`,
      );

      const data = await this.statisticsService.getRecentProducts(
        restaurantId,
        query.limit,
      );

      return new ApiResponseDto(
        data,
        'Recent products retrieved successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error getting recent products', error);
      throw new HttpException(
        {
          status: 'error',
          code: '500',
          message: 'Internal server error',
          error: {
            code: '500',
            message:
              'An unexpected error occurred while retrieving recent products',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
