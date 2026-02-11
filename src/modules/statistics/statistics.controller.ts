import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiResponse as ApiResponseDto } from '../../common/dto/api-response.dto/api-response.dto';
import { CategoriesCountResponseDto } from './dto/categories-count-response.dto';
import { ProductsCountResponseDto } from './dto/products-count-response.dto';
import { RecentProductsResponseDto } from './dto/recent-products-response.dto';
import { StatisticsQueryDto } from './dto/statistics-query.dto';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  private readonly logger = new Logger(StatisticsController.name);
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('products/count')
  @ApiOperation({
    summary: 'Get total products count for a restaurant',
    description:
      'Returns the total number of products for a specific restaurant using the restaurant_id index for optimal performance',
  })
  @ApiQuery({
    name: 'restaurant_id',
    type: String,
    required: true,
    description: 'Restaurant UUID identifier',
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
            'No restaurant found with id: 550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  async getProductsCount(
    @Query() query: StatisticsQueryDto,
  ): Promise<ApiResponseDto<ProductsCountResponseDto>> {
    try {
      this.logger.log(
        `Getting products count for restaurant: ${query.restaurant_id}`,
      );

      const data = await this.statisticsService.getProductsCount(
        query.restaurant_id,
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
    summary: 'Get total categories count for a restaurant',
    description:
      'Returns the total number of categories for a specific restaurant using the restaurant_id index for optimal performance',
  })
  @ApiQuery({
    name: 'restaurant_id',
    type: String,
    required: true,
    description: 'Restaurant UUID identifier',
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
    @Query() query: StatisticsQueryDto,
  ): Promise<ApiResponseDto<CategoriesCountResponseDto>> {
    try {
      this.logger.log(
        `Getting categories count for restaurant: ${query.restaurant_id}`,
      );

      const data = await this.statisticsService.getCategoriesCount(
        query.restaurant_id,
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
    summary: 'Get recent products for a restaurant',
    description:
      'Returns the most recent products for a specific restaurant, ordered by creation date DESC using the created_at index for optimal performance',
  })
  @ApiQuery({
    name: 'restaurant_id',
    type: String,
    required: true,
    description: 'Restaurant UUID identifier',
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
    @Query() query: StatisticsQueryDto,
  ): Promise<ApiResponseDto<RecentProductsResponseDto>> {
    try {
      this.logger.log(
        `Getting recent products for restaurant: ${query.restaurant_id}, limit: ${query.limit}`,
      );

      const data = await this.statisticsService.getRecentProducts(
        query.restaurant_id,
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
