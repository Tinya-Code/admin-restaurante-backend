import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse as ApiResponseDto } from '../../common/dto/api-response.dto/api-response.dto';
import { RestaurantSettingsResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';
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
  @ApiHeader({
    name: 'x-restaurant-id',
    required: false,
    description: 'ID de restaurante opcional',
  })
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
  @ApiHeader({
    name: 'x-restaurant-id',
    required: false,
    description: 'ID de restaurante opcional',
  })
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
}
