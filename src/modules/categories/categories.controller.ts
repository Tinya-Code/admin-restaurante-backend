import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  HttpStatus,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ApiResponse } from '../../common/dto/api-response.dto/api-response.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantMemberGuard } from '../../common/guards/restaurant-member/restaurant-member.guard';
import { CurrentMenu } from '../../common/decorators/menu.decorator';
import { CurrentBranch } from '../../common/decorators/branch.decorator';

@ApiTags('categories')
@ApiBearerAuth()
@ApiHeader({ name: 'x-restaurant-id', required: true, description: 'UUID del restaurante activo' })
@ApiHeader({ name: 'x-branch-id', required: false, description: 'UUID de la sucursal (default: sucursal principal)' })
@ApiHeader({ name: 'x-menu-id', required: false, description: 'UUID del menú (default: primer menú activo)' })
@UseGuards(FirebaseAuthGuard, RestaurantMemberGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva categoría en el menú activo' })
  @ApiCreatedResponse({
    description: 'Categoría creada exitosamente',
    type: CategoryResponseDto,
  })
  @ApiConflictResponse({ description: 'Nombre duplicado en el menú activo' })
  @ApiBadRequestResponse({ description: 'Validación fallida' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @CurrentBranch() branchId: string,
    @CurrentMenu() menuId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    const category = await this.categoriesService.create(
      branchId,
      menuId,
      createCategoryDto,
    );
    return new ApiResponse(category, 'Categoría creada exitosamente');
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorías del menú activo con paginación' })
  @SwaggerResponse({ status: 200, description: 'Listado de categorías' })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean, example: true })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    enum: ['display_order', 'name', 'created_at'],
    example: 'display_order',
  })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], example: 'ASC' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'type_id', required: false, type: String, example: 'uuid-category-type' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @CurrentMenu() menuId: string,
    @Query() query: QueryCategoryDto,
  ) {
    const result = await this.categoriesService.findAll(menuId, query);
    return new ApiResponse(
      result.data,
      'Listado de categorías obtenido correctamente',
      result.meta,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Categoría encontrada',
    type: CategoryResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Categoría no encontrada o no pertenece a la sucursal activa' })
  @ApiParam({ name: 'id', type: String, example: 'c0a80123-4567-89ab-cdef-1234567890ab' })
  async findOne(
    @CurrentBranch() branchId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const category = await this.categoriesService.findOne(branchId, id);
    return new ApiResponse(category, 'Categoría obtenida correctamente');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @SwaggerResponse({
    status: 200,
    description: 'Categoría actualizada',
    type: CategoryResponseDto,
  })
  @ApiConflictResponse({ description: 'Nombre duplicado en el menú' })
  @ApiNotFoundResponse({ description: 'Categoría no encontrada o no pertenece a la sucursal activa' })
  @ApiParam({ name: 'id', type: String, example: 'c0a80123-4567-89ab-cdef-1234567890ab' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @CurrentBranch() branchId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(
      branchId,
      id,
      updateCategoryDto,
    );
    return new ApiResponse(category, 'Categoría actualizada exitosamente');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una categoría (y sus productos en cascada) ' })
  @SwaggerResponse({ status: HttpStatus.NO_CONTENT, description: 'Eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'Categoría no encontrada o no pertenece a la sucursal activa' })
  @ApiParam({ name: 'id', type: String, example: 'c0a80123-4567-89ab-cdef-1234567890ab' })
  async remove(
    @CurrentBranch() branchId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.categoriesService.remove(branchId, id);
  }
}
