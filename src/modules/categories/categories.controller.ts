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
import type { Response } from 'express';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ApiResponse } from '../../common/dto/api-response.dto/api-response.dto';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantOwnerGuard } from 'src/common/guards/restaurant-owner/restaurant-owner.guard';
import { CurrentRestaurant } from 'src/common/decorators/restaurant.decorator';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantOwnerGuard)
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva categoría' })
  @ApiCreatedResponse({
    description: 'Categoría creada',
    type: CategoryResponseDto,
  })
  @ApiConflictResponse({ description: 'Nombre duplicado para el restaurante' })
  @ApiBadRequestResponse({ description: 'Validación fallida' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentRestaurant() restaurantId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    const category = await this.categoriesService.create(
      restaurantId,
      createCategoryDto,
    );
    return new ApiResponse(category, 'Categoría creada exitosamente');
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorías con paginación' })
  @SwaggerResponse({ status: 200, description: 'Listado de categorías' })
  @ApiHeader({
    name: 'x-restaurant-id',
    required: false,
    description: 'ID de restaurante opcional para sobrescribir el contexto automático',
  })
  @ApiQuery({
    name: 'menu_id',
    required: false,
    type: String,
    example: 'e61d4b41-4813-4be1-93db-79373f563580',
  })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean, example: true })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    enum: ['display_order', 'name', 'created_at'],
    example: 'display_order',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @CurrentRestaurant() restaurantId: string,
    @Query() query: QueryCategoryDto,
  ) {
    const result = await this.categoriesService.findAll(restaurantId, query);
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
  @ApiNotFoundResponse({ description: 'Categoría no encontrada' })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'c0a80123-4567-89ab-cdef-1234567890ab',
  })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const category = await this.categoriesService.findOne(id);
    return new ApiResponse(category, 'Categoría obtenida correctamente');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @SwaggerResponse({
    status: 200,
    description: 'Categoría actualizada',
    type: CategoryResponseDto,
  })
  @ApiConflictResponse({ description: 'Nombre duplicado para el restaurante' })
  @ApiNotFoundResponse({ description: 'Categoría no encontrada' })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'c0a80123-4567-89ab-cdef-1234567890ab',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return new ApiResponse(category, 'Categoría actualizada exitosamente');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una categoría' })
  @SwaggerResponse({ status: HttpStatus.NO_CONTENT, description: 'Eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'Categoría no encontrada' })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'c0a80123-4567-89ab-cdef-1234567890ab',
  })
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.categoriesService.remove(id);
  }
}
