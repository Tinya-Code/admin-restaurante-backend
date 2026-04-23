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
import { CombosService } from './combos.service';
import { ComboResponseDto } from './dto/combo-response.dto';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';

@ApiTags('combos')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantMemberGuard)
@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los combos de la sucursal activa' })
  @ApiResponse({ status: 200, type: ApiResponseDto<ComboResponseDto[]> })
  async findAll(
    @CurrentBranch() branchId: string,
  ): Promise<ApiResponseDto<ComboResponseDto[]>> {
    const data = await this.combosService.findAll(branchId);
    return new ApiResponseDto(data, 'Combos obtenidos exitosamente');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un combo' })
  @ApiResponse({ status: 200, type: ApiResponseDto<ComboResponseDto> })
  async findOne(
    @CurrentBranch() branchId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<ComboResponseDto>> {
    const data = await this.combosService.findOne(branchId, id);
    return new ApiResponseDto(data, 'Detalle del combo obtenido exitosamente');
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo combo para la sucursal activa' })
  @ApiResponse({ status: 201, type: ApiResponseDto<ComboResponseDto> })
  @ApiResponse({ status: 403, description: 'Límite de combos del plan alcanzado' })
  async create(
    @CurrentBranch() branchId: string,
    @Body() createDto: CreateComboDto,
  ): Promise<ApiResponseDto<ComboResponseDto>> {
    const data = await this.combosService.create(branchId, createDto);
    return new ApiResponseDto(data, 'Combo creado exitosamente');
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reordenar combos de la sucursal activa' })
  @ApiResponse({ status: 200, description: 'Combos reordenados exitosamente' })
  async reorder(
    @CurrentBranch() branchId: string,
    @Body('comboIds') comboIds: string[],
  ): Promise<ApiResponseDto<void>> {
    await this.combosService.reorder(branchId, comboIds);
    return new ApiResponseDto(undefined, 'Combos reordenados exitosamente');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un combo' })
  @ApiResponse({ status: 200, type: ApiResponseDto<ComboResponseDto> })
  async update(
    @CurrentBranch() branchId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateComboDto,
  ): Promise<ApiResponseDto<ComboResponseDto>> {
    const data = await this.combosService.update(branchId, id, updateDto);
    return new ApiResponseDto(data, 'Combo actualizado exitosamente');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un combo y su imagen asociada' })
  @ApiResponse({ status: 200, description: 'Combo eliminado exitosamente' })
  async remove(
    @CurrentBranch() branchId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<void>> {
    await this.combosService.remove(branchId, id);
    return new ApiResponseDto(undefined, 'Combo eliminado exitosamente');
  }
}
