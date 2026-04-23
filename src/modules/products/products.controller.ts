import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { Product } from './entities/product.entity';
import { ApiResponse } from '../../common/dto/api-response.dto/api-response.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantMemberGuard } from '../../common/guards/restaurant-member/restaurant-member.guard';
import { CurrentBranch } from '../../common/decorators/branch.decorator';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantMemberGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo producto',
    description:
      'Crea un producto en la sucursal activa. (La subida de imágenes está temporalmente deshabilitada, enviar json normal).',
  })
  @SwaggerResponse({
    status: HttpStatus.CREATED,
    description: 'Producto creado exitosamente',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o precio negativo',
  })
  @ApiNotFoundResponse({
    description: 'Categoría no encontrada o no pertenece a esta sucursal',
  })
  @SwaggerResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Límite de productos del plan alcanzado',
  })
  async create(
    @CurrentBranch() branchId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createProductDto: CreateProductDto,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productsService.create(branchId, createProductDto);
    return new ApiResponse(product, 'Producto creado exitosamente');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar productos con filtros y paginación',
    description:
      'Obtiene una lista paginada de productos de la sucursal activa con filtros opcionales por categoría, disponibilidad y rango de precios.',
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    description: 'Filtrar por categoría específica',
    example: '239f1742-fc12-4f17-bf2a-bd955890582b',
  })
  @ApiQuery({
    name: 'is_available',
    required: false,
    description: 'Filtrar por disponibilidad (true/false)',
    example: true,
    type: Boolean,
  })
  @ApiQuery({
    name: 'min_price',
    required: false,
    description: 'Precio mínimo para filtrar',
    example: 10,
    type: Number,
  })
  @ApiQuery({
    name: 'max_price',
    required: false,
    description: 'Precio máximo para filtrar',
    example: 50,
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (default: 1)',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página (default: 10, max: 100)',
    example: 10,
    type: Number,
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    description: 'Campo para ordenar',
    enum: ['name', 'price', 'created_at'],
    example: 'name',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Dirección del ordenamiento',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Lista de productos obtenida exitosamente',
  })
  @ApiBadRequestResponse({
    description: 'Parámetros de query inválidos',
  })
  async findAll(
    @CurrentBranch() branchId: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    queryDto: QueryProductDto,
  ): Promise<ApiResponse<Product[]>> {
    const { data, meta } = await this.productsService.findAll(branchId, queryDto);
    return new ApiResponse(data, 'Productos obtenidos exitosamente', meta);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un producto por ID',
    description:
      'Obtiene los detalles completos de un producto específico de la sucursal activa, incluyendo información de su categoría.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto (UUID)',
    example: '9c0b1132-c388-445d-8e47-08afe12a10ce',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Producto encontrado exitosamente',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado en esta sucursal',
  })
  async findOne(
    @CurrentBranch() branchId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productsService.findOne(branchId, id);
    return new ApiResponse(product, 'Producto obtenido exitosamente');
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar un producto',
    description:
      'Actualiza los campos de un producto de la sucursal activa. (La subida de imágenes está temporalmente deshabilitada).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a actualizar',
    example: '9c0b1132-c388-445d-8e47-08afe12a10ce',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Producto actualizado exitosamente',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o precio negativo',
  })
  @ApiNotFoundResponse({
    description: 'Producto o categoría no encontrada en esta sucursal',
  })
  async update(
    @CurrentBranch() branchId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateProductDto: UpdateProductDto,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productsService.update(branchId, id, updateProductDto);
    return new ApiResponse(product, 'Producto actualizado exitosamente');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un producto (hard delete)',
    description:
      'Elimina permanentemente un producto de la sucursal activa y su imagen de Cloudinary.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a eliminar',
    example: '9c0b1132-c388-445d-8e47-08afe12a10ce',
  })
  @SwaggerResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Producto eliminado exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado en esta sucursal',
  })
  async remove(
    @CurrentBranch() branchId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.productsService.remove(branchId, id);
  }

  @Patch(':id/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deshabilitar un producto (soft delete)',
    description:
      'Marca un producto como no disponible (is_available = false). El producto y su imagen se mantienen en el sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a deshabilitar',
    example: '9c0b1132-c388-445d-8e47-08afe12a10ce',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Producto deshabilitado exitosamente',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado en esta sucursal',
  })
  async softRemove(
    @CurrentBranch() branchId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productsService.softRemove(branchId, id);
    return new ApiResponse(product, 'Producto deshabilitado exitosamente');
  }
}
