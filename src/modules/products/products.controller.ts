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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ReorderProductsDto } from './dto/reorder-products.dto';
import { Product } from './entities/product.entity';
import { ApiResponse } from 'src/common/dto/api-response.dto/api-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo producto',
    description:
      'Crea un producto. Si se proporciona una imagen, se sube automáticamente a Cloudinary.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @SwaggerResponse({
    status: HttpStatus.CREATED,
    description: 'Producto creado exitosamente',
    type: Product,
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos, precio negativo o error al subir imagen',
  })
  @ApiNotFoundResponse({
    description: 'Categoría no encontrada o no pertenece al restaurante',
  })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<Product>> {
    if (file) {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      createProductDto.image = base64Image;
    }

    const product = await this.productsService.create(createProductDto);
    return new ApiResponse(product, 'Producto creado exitosamente');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar productos con filtros y paginación',
    description:
      'Obtiene una lista paginada de productos con filtros opcionales por categoría, disponibilidad y rango de precios.',
  })
  @ApiQuery({
    name: 'restaurant_id',
    required: true,
    description: 'ID del restaurante (requerido)',
    example: '5a53d32f-834d-43df-a9ed-5db9b6badef9',
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
    enum: ['display_order', 'name', 'price', 'created_at'],
    example: 'display_order',
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
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    queryDto: QueryProductDto,
  ): Promise<ApiResponse<Product[]>> {
    const { data, meta } = await this.productsService.findAll(queryDto);
    return new ApiResponse(data, 'Productos obtenidos exitosamente', meta);
  }

  /**
   * READ ONE - Obtener producto específico por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un producto por ID',
    description:
      'Obtiene los detalles completos de un producto específico, incluyendo información de su categoría.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto (UUID)',
    example: '9c0b1132-c388-445d-8e47-08afe12a10ce',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Producto encontrado exitosamente',
    type: Product,
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado',
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productsService.findOne(id);
    return new ApiResponse(product, 'Producto obtenido exitosamente');
  }

  /**
   * UPDATE - Actualizar producto
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar un producto',
    description:
      'Actualiza los campos de un producto. Si se envía una nueva imagen, la anterior se elimina de Cloudinary. No se puede cambiar el restaurant_id.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiParam({
    name: 'id',
    description: 'ID del producto a actualizar',
    example: '9c0b1132-c388-445d-8e47-08afe12a10ce',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Producto actualizado exitosamente',
    type: Product,
  })
  @ApiBadRequestResponse({
    description:
      'Datos inválidos, precio negativo, intento de cambiar restaurant_id o no hay campos para actualizar',
  })
  @ApiNotFoundResponse({
    description: 'Producto o categoría no encontrada',
  })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<Product>> {
    // Si viene archivo multipart, convertir a base64
    if (file) {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      updateProductDto['image'] = base64Image;
    }

    const product = await this.productsService.update(id, updateProductDto);
    return new ApiResponse(product, 'Producto actualizado exitosamente');
  }

  /**
   * DELETE - Eliminar producto permanentemente
   * Elimina el producto y su imagen de Cloudinary
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un producto (hard delete)',
    description:
      'Elimina permanentemente un producto de la base de datos y su imagen de Cloudinary.',
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
    description: 'Producto no encontrado',
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.productsService.remove(id);
  }

  /**
   * SOFT DELETE - Deshabilitar producto
   */
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
    type: Product,
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado',
  })
  async softRemove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productsService.softRemove(id);
    return new ApiResponse(product, 'Producto deshabilitado exitosamente');
  }

  /**
   * REORDER - Reordenar múltiples productos en una transacción
   */
  @Patch('reorder/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reordenar múltiples productos',
    description:
      'Actualiza el display_order de múltiples productos en una sola transacción atómica.',
  })
  @ApiBody({
    type: ReorderProductsDto,
    description: 'Array de productos con sus nuevos órdenes',
    examples: {
      example1: {
        value: {
          updates: [
            {
              id: '9c0b1132-c388-445d-8e47-08afe12a10ce',
              display_order: 0,
            },
            {
              id: '8b1a0021-b277-334c-7d36-97ace01b09bd',
              display_order: 1,
            },
            {
              id: '7a093110-a166-223b-6c25-86bcd00a98ac',
              display_order: 2,
            },
          ],
        },
      },
    },
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Productos reordenados exitosamente',
  })
  @ApiBadRequestResponse({
    description: 'Datos de reordenamiento inválidos',
  })
  async reorder(
    @Body(new ValidationPipe({ transform: true }))
    reorderDto: ReorderProductsDto,
  ): Promise<ApiResponse<null>> {
    await this.productsService.reorder(reorderDto.updates);
    return new ApiResponse(null, 'Productos reordenados exitosamente');
  }
}
