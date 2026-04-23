import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse as ApiResponseDto } from '../../common/dto/api-response.dto/api-response.dto';
import { RestaurantProfileResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantProfileDto } from './dto/update-restaurant-settings.dto';
import { SettingsService } from './settings.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantMemberGuard } from '../../common/guards/restaurant-member/restaurant-member.guard';
import { CurrentRestaurant } from '../../common/decorators/restaurant.decorator';
import { CurrentBranch } from '../../common/decorators/branch.decorator';
import { UpdateBranchSettingsDto } from './dto/update-branch-settings.dto';
import { BranchSettingsResponseDto } from './dto/branch-settings-response.dto';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantMemberGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // --- Restaurant Profile ---

  @Get('restaurant')
  @ApiOperation({ summary: 'Obtener el perfil del restaurante (nombre, datos y plan activo)' })
  @ApiResponse({ status: 200, type: ApiResponseDto<RestaurantProfileResponseDto> })
  async getRestaurantProfile(
    @CurrentRestaurant() restaurantId: string,
  ): Promise<ApiResponseDto<RestaurantProfileResponseDto>> {
    const data = await this.settingsService.getRestaurantProfile(restaurantId);
    return new ApiResponseDto(data, 'Perfil de restaurante obtenido exitosamente');
  }

  @Patch('restaurant')
  @ApiOperation({ summary: 'Actualizar perfil del restaurante (nombre, teléfono, dirección)' })
  @ApiResponse({ status: 200, type: ApiResponseDto<RestaurantProfileResponseDto> })
  async updateRestaurantProfile(
    @CurrentRestaurant() restaurantId: string,
    @Body() updateData: UpdateRestaurantProfileDto,
  ): Promise<ApiResponseDto<RestaurantProfileResponseDto>> {
    const data = await this.settingsService.updateRestaurantProfile(restaurantId, updateData);
    return new ApiResponseDto(data, 'Perfil de restaurante actualizado exitosamente');
  }

  // --- Branch Settings ---

  @Get('branch')
  @ApiOperation({ summary: 'Obtener la configuración completa de la sucursal activa' })
  @ApiResponse({ status: 200, type: ApiResponseDto<BranchSettingsResponseDto> })
  async getBranchSettings(
    @CurrentBranch() branchId: string,
  ): Promise<ApiResponseDto<BranchSettingsResponseDto>> {
    const data = await this.settingsService.getBranchSettings(branchId);
    return new ApiResponseDto(data, 'Configuración de sucursal obtenida exitosamente');
  }

  @Put('branch')
  @ApiOperation({ summary: 'Actualizar la configuración de la sucursal activa (merge parcial por sección)' })
  @ApiResponse({ status: 200, type: ApiResponseDto<BranchSettingsResponseDto> })
  async updateBranchSettings(
    @CurrentBranch() branchId: string,
    @Body() updateData: UpdateBranchSettingsDto,
  ): Promise<ApiResponseDto<BranchSettingsResponseDto>> {
    const data = await this.settingsService.updateBranchSettings(branchId, updateData);
    return new ApiResponseDto(data, 'Configuración de sucursal actualizada exitosamente');
  }
}

