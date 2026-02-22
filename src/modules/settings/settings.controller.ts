import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiResponse as ApiResponseDto } from '../../common/dto/api-response.dto/api-response.dto';
import { RestaurantSettingsResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';
import { SettingsService } from './settings.service';

@Controller('business-settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get business settings for a restaurant',
    description:
      'Returns the business settings for a specific restaurant. If no settings exist, returns default settings.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Restaurant UUID identifier',
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
    @Param('id') id: string,
  ): Promise<ApiResponseDto<RestaurantSettingsResponseDto>> {
    try {
      this.logger.log(`Getting business settings for restaurant: ${id}`);

      const data = await this.settingsService.getBusinessSettings(id);

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

  @Put(':id')
  @ApiOperation({
    summary: 'Update business settings for a restaurant',
    description:
      'Updates the business settings for a specific restaurant. Creates new settings if none exist. Only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Restaurant UUID identifier',
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
    @Param('id') id: string,
    @Body() updateData: UpdateRestaurantSettingsDto,
  ): Promise<ApiResponseDto<RestaurantSettingsResponseDto>> {
    try {
      this.logger.log(`Updating business settings for restaurant: ${id}`);

      const data = await this.settingsService.updateBusinessSettings(
        id,
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
