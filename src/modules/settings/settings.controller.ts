import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse as ApiResponseDto } from '../../common/dto/api-response.dto/api-response.dto';
import { RestaurantSettingsResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerResponseDto } from './dto/banner-response.dto';
import { SettingsService } from './settings.service';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantOwnerGuard } from 'src/common/guards/restaurant-owner/restaurant-owner.guard';
import { CurrentRestaurant } from 'src/common/decorators/restaurant.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantOwnerGuard)
@Controller('business-settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);
  constructor(private readonly settingsService: SettingsService) {}

  @Get()

  @ApiOperation({
    summary: 'Get business settings for a restaurant',
    description:
      'Returns the business settings for the current restaurant context. If no settings exist, returns default settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business settings retrieved successfully',
    type: ApiResponseDto<RestaurantSettingsResponseDto>,
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
          message: 'id must be a valid UUID',
          details: {
            field: 'id',
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
  async getBusinessSettings(
    @CurrentRestaurant() restaurantId: string,
  ): Promise<ApiResponseDto<RestaurantSettingsResponseDto>> {
    try {
      this.logger.log(`Getting business settings for restaurant: ${restaurantId}`);

      const data = await this.settingsService.getBusinessSettings(restaurantId);

      return new ApiResponseDto(
        data,
        'Business settings retrieved successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error getting business settings', error);
      throw new HttpException(
        {
          status: 'error',
          code: '500',
          message: 'Internal server error',
          error: {
            code: '500',
            message:
              'An unexpected error occurred while retrieving business settings',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put()

  @ApiOperation({
    summary: 'Update business settings for a restaurant',
    description:
      'Updates the business settings for the current restaurant context. Creates new settings if none exist. Only provided fields will be updated.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business settings updated successfully',
    type: ApiResponseDto<RestaurantSettingsResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format or invalid request body',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found',
  })
  async updateBusinessSettings(
    @CurrentRestaurant() restaurantId: string,
    @Body() updateData: UpdateRestaurantSettingsDto,
  ): Promise<ApiResponseDto<RestaurantSettingsResponseDto>> {
    try {
      this.logger.log(`Updating business settings for restaurant: ${restaurantId}`);

      const data = await this.settingsService.updateBusinessSettings(
        restaurantId,
        updateData,
      );

      return new ApiResponseDto(data, 'Business settings updated successfully');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error updating business settings', error);
      throw new HttpException(
        {
          status: 'error',
          code: '500',
          message: 'Internal server error',
          error: {
            code: '500',
            message:
              'An unexpected error occurred while updating business settings',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // --- Banners Endpoints ---

  @Get('banners')
  @ApiOperation({ summary: 'Get all banners for the restaurant' })
  @ApiResponse({ status: 200, type: ApiResponseDto<BannerResponseDto[]> })
  async getBanners(
    @CurrentRestaurant() restaurantId: string,
  ): Promise<ApiResponseDto<BannerResponseDto[]>> {
    const data = await this.settingsService.getBanners(restaurantId);
    return new ApiResponseDto(data, 'Banners retrieved successfully');
  }

  @Post('banners')
  @ApiOperation({ summary: 'Create a new banner' })
  @ApiResponse({ status: 201, type: ApiResponseDto<BannerResponseDto> })
  async createBanner(
    @CurrentRestaurant() restaurantId: string,
    @Body() createDto: CreateBannerDto,
  ): Promise<ApiResponseDto<BannerResponseDto>> {
    const data = await this.settingsService.createBanner(restaurantId, createDto);
    return new ApiResponseDto(data, 'Banner created successfully');
  }

  @Patch('banners/:id')
  @ApiOperation({ summary: 'Update a banner' })
  @ApiResponse({ status: 200, type: ApiResponseDto<BannerResponseDto> })
  async updateBanner(
    @CurrentRestaurant() restaurantId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateBannerDto,
  ): Promise<ApiResponseDto<BannerResponseDto>> {
    const data = await this.settingsService.updateBanner(restaurantId, id, updateDto);
    return new ApiResponseDto(data, 'Banner updated successfully');
  }

  @Delete('banners/:id')
  @ApiOperation({ summary: 'Delete a banner' })
  @ApiResponse({ status: 200, description: 'Banner deleted successfully' })
  async deleteBanner(
    @CurrentRestaurant() restaurantId: string,
    @Param('id') id: string,
  ): Promise<ApiResponseDto<void>> {
    await this.settingsService.deleteBanner(restaurantId, id);
    return new ApiResponseDto(undefined, 'Banner deleted successfully');
  }

  @Patch('banners/reorder')
  @ApiOperation({ summary: 'Reorder banners' })
  @ApiResponse({ status: 200, description: 'Banners reordered successfully' })
  async reorderBanners(
    @CurrentRestaurant() restaurantId: string,
    @Body('bannerIds') bannerIds: string[],
  ): Promise<ApiResponseDto<void>> {
    await this.settingsService.reorderBanners(restaurantId, bannerIds);
    return new ApiResponseDto(undefined, 'Banners reordered successfully');
  }
}
