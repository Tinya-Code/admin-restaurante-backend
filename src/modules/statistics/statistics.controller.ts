import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../common/dto/api-response.dto/api-response.dto';
import { ApiErrorDto } from '../../common/dto/api-error.dto/api-error.dto';
import { CategoriesCountResponseDto } from './dto/categories-count-response.dto';
import { ProductsCountResponseDto } from './dto/products-count-response.dto';
import { RecentProductsResponseDto } from './dto/recent-products-response.dto';
import { CombosCountResponseDto } from './dto/combos-count-response.dto';
import { VisitsOverviewResponseDto } from './dto/visits-overview-response.dto';
import { StatisticsQueryDto } from './dto/statistics-query.dto';
import { StatisticsService } from './statistics.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantMemberGuard } from '../../common/guards/restaurant-member/restaurant-member.guard';
import { CurrentBranch } from '../../common/decorators/branch.decorator';

@ApiTags('statistics')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantMemberGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('products/count')
  @ApiOperation({
    summary: 'Get total products count',
    description: 'Returns the total number of products for the current branch',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Products count retrieved successfully',
    type: ProductsCountResponseDto,
  })
  @SwaggerResponse({
    status: 400,
    description: 'Invalid UUID format',
    type: ApiErrorDto,
  })
  @SwaggerResponse({
    status: 404,
    description: 'Branch not found',
    type: ApiErrorDto,
  })
  async getProductsCount(
    @CurrentBranch() branchId: string,
  ): Promise<ApiResponse<ProductsCountResponseDto>> {
    const data = await this.statisticsService.getProductsCount(branchId);
    return new ApiResponse(data, 'Products count retrieved successfully');
  }

  @Get('categories/count')
  @ApiOperation({
    summary: 'Get total categories count',
    description: 'Returns the total number of categories for the current branch',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Categories count retrieved successfully',
    type: CategoriesCountResponseDto,
  })
  @SwaggerResponse({
    status: 400,
    description: 'Invalid UUID format',
    type: ApiErrorDto,
  })
  @SwaggerResponse({
    status: 404,
    description: 'Branch not found',
    type: ApiErrorDto,
  })
  async getCategoriesCount(
    @CurrentBranch() branchId: string,
  ): Promise<ApiResponse<CategoriesCountResponseDto>> {
    const data = await this.statisticsService.getCategoriesCount(branchId);
    return new ApiResponse(data, 'Categories count retrieved successfully');
  }

  @Get('products/recent')
  @ApiOperation({
    summary: 'Get recent products',
    description: 'Returns the most recent products for the current branch, ordered by creation date DESC',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Maximum number of products to return (default: 5)',
    example: 5,
  })
  @SwaggerResponse({
    status: 200,
    description: 'Recent products retrieved successfully',
    type: RecentProductsResponseDto,
  })
  @SwaggerResponse({
    status: 400,
    description: 'Invalid limit out of range',
    type: ApiErrorDto,
  })
  async getRecentProducts(
    @CurrentBranch() branchId: string,
    @Query() query: StatisticsQueryDto,
  ): Promise<ApiResponse<RecentProductsResponseDto>> {
    const data = await this.statisticsService.getRecentProducts(branchId, query.limit);
    return new ApiResponse(data, 'Recent products retrieved successfully');
  }

  @Get('combos/count')
  @ApiOperation({
    summary: 'Get total combos count',
    description: 'Returns the total number of combos for the current branch',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Combos count retrieved successfully',
    type: CombosCountResponseDto,
  })
  async getCombosCount(
    @CurrentBranch() branchId: string,
  ): Promise<ApiResponse<CombosCountResponseDto>> {
    const data = await this.statisticsService.getCombosCount(branchId);
    return new ApiResponse(data, 'Combos count retrieved successfully');
  }

  @Get('visits/overview')
  @ApiOperation({
    summary: 'Get visits overview',
    description: 'Returns total visits and breakdown by visit type for the current branch',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Visits overview retrieved successfully',
    type: VisitsOverviewResponseDto,
  })
  async getVisitsOverview(
    @CurrentBranch() branchId: string,
  ): Promise<ApiResponse<VisitsOverviewResponseDto>> {
    const data = await this.statisticsService.getVisitsOverview(branchId);
    return new ApiResponse(data, 'Visits overview retrieved successfully');
  }
}
