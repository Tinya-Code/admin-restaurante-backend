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
  Res,
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
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ApiResponse } from '../../common/dto/api-response.dto/api-response.dto'; // DTO genérico usado en todos los módulos

@ApiTags('categories')
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
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return new ApiResponse(category, 'Categoría creada exitosamente');
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorías con paginación' })
  @SwaggerResponse({ status: 200, description: 'Listado de categorías' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() query: QueryCategoryDto) {
    const result = await this.categoriesService.findAll(query);
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return new ApiResponse(category, 'Categoría actualizada exitosamente');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una categoría' })
  @SwaggerResponse({ status: 204, description: 'Eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'Categoría no encontrada' })
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Res() res: Response,
  ) {
    await this.categoriesService.remove(id);
    return res
      .status(HttpStatus.NO_CONTENT)
      .send(new ApiResponse(null, 'Categoría eliminada exitosamente'));
  }
}
