import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse as ApiResponseDto } from '../../common/dto/api-response.dto/api-response.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerResponseDto } from './dto/banner-response.dto';
import { BannersService } from './banners.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantMemberGuard } from '../../common/guards/restaurant-member/restaurant-member.guard';
import { CurrentBranch } from '../../common/decorators/branch.decorator';

@ApiTags('banners')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantMemberGuard)
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los banners de la sucursal activa' })
  @ApiResponse({ status: 200, type: ApiResponseDto<BannerResponseDto[]> })
  async getBanners(
    @CurrentBranch() branchId: string,
  ): Promise<ApiResponseDto<BannerResponseDto[]>> {
    const data = await this.bannersService.getBanners(branchId);
    return new ApiResponseDto(data, 'Banners obtenidos exitosamente');
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo banner para la sucursal activa' })
  @ApiResponse({ status: 201, type: ApiResponseDto<BannerResponseDto> })
  @ApiResponse({ status: 403, description: 'Límite de banners del plan alcanzado' })
  async createBanner(
    @CurrentBranch() branchId: string,
    @Body() createDto: CreateBannerDto,
  ): Promise<ApiResponseDto<BannerResponseDto>> {
    const data = await this.bannersService.createBanner(branchId, createDto);
    return new ApiResponseDto(data, 'Banner creado exitosamente');
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reordenar banners de la sucursal activa' })
  @ApiResponse({ status: 200, description: 'Banners reordenados exitosamente' })
  async reorderBanners(
    @CurrentBranch() branchId: string,
    @Body('bannerIds') bannerIds: string[],
  ): Promise<ApiResponseDto<void>> {
    await this.bannersService.reorderBanners(branchId, bannerIds);
    return new ApiResponseDto(undefined, 'Banners reordenados exitosamente');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un banner' })
  @ApiResponse({ status: 200, type: ApiResponseDto<BannerResponseDto> })
  async updateBanner(
    @CurrentBranch() branchId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBannerDto,
  ): Promise<ApiResponseDto<BannerResponseDto>> {
    const data = await this.bannersService.updateBanner(branchId, id, updateDto);
    return new ApiResponseDto(data, 'Banner actualizado exitosamente');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un banner y su imagen de Cloudinary' })
  @ApiResponse({ status: 200, description: 'Banner eliminado exitosamente' })
  async deleteBanner(
    @CurrentBranch() branchId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<void>> {
    await this.bannersService.deleteBanner(branchId, id);
    return new ApiResponseDto(undefined, 'Banner eliminado exitosamente');
  }
}
