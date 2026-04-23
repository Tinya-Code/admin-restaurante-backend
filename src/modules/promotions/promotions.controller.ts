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
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantMemberGuard } from '../../common/guards/restaurant-member/restaurant-member.guard';
import { CurrentBranch } from '../../common/decorators/branch.decorator';
import { PromotionsService } from './promotions.service';
import { PromotionResponseDto } from './dto/promotion-response.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@ApiTags('promotions')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantMemberGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las promociones de la sucursal activa' })
  @ApiResponse({ status: 200, type: ApiResponseDto<PromotionResponseDto[]> })
  async findAll(
    @CurrentBranch() branchId: string,
  ): Promise<ApiResponseDto<PromotionResponseDto[]>> {
    const data = await this.promotionsService.findAll(branchId);
    return new ApiResponseDto(data, 'Promociones obtenidas exitosamente');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una promoción' })
  @ApiResponse({ status: 200, type: ApiResponseDto<PromotionResponseDto> })
  async findOne(
    @CurrentBranch() branchId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<PromotionResponseDto>> {
    const data = await this.promotionsService.findOne(branchId, id);
    return new ApiResponseDto(data, 'Detalle de promoción obtenido exitosamente');
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva promoción' })
  @ApiResponse({ status: 201, type: ApiResponseDto<PromotionResponseDto> })
  @ApiResponse({ status: 403, description: 'Límite de promociones del plan alcanzado' })
  async create(
    @CurrentBranch() branchId: string,
    @Body() createDto: CreatePromotionDto,
  ): Promise<ApiResponseDto<PromotionResponseDto>> {
    const data = await this.promotionsService.create(branchId, createDto);
    return new ApiResponseDto(data, 'Promoción creada exitosamente');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una promoción' })
  @ApiResponse({ status: 200, type: ApiResponseDto<PromotionResponseDto> })
  async update(
    @CurrentBranch() branchId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePromotionDto,
  ): Promise<ApiResponseDto<PromotionResponseDto>> {
    const data = await this.promotionsService.update(branchId, id, updateDto);
    return new ApiResponseDto(data, 'Promoción actualizada exitosamente');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una promoción' })
  @ApiResponse({ status: 200, description: 'Promoción eliminada exitosamente' })
  async remove(
    @CurrentBranch() branchId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<void>> {
    await this.promotionsService.remove(branchId, id);
    return new ApiResponseDto(undefined, 'Promoción eliminada exitosamente');
  }
}
