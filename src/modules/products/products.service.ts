import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './entities/product.entity';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto/pagination-meta.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    restaurantId: string,
    dto: CreateProductDto,
  ): Promise<Product> {
    await this.validateCategory(dto.category_id, restaurantId);

    let image_url: string | null = null;
    if (dto.image) {
      image_url = await this.uploadProductImage(dto.image);
    }

    try {
      const { image, price, ...productData } = dto;
      const payload: Partial<Product> = {
        ...productData,
        price: price?.toString(),
        image_url,
      };
      return await this.productsRepository.create(restaurantId, payload);
    } catch (error) {
      if (image_url) await this.cloudinaryService.deleteImage(image_url);
      
      if (error.code === '23514') {
        throw new BadRequestException('El precio debe ser mayor o igual a 0');
      }
      throw error;
    }
  }

  async findAll(
    restaurantId: string,
    queryDto: QueryProductDto,
  ): Promise<{ data: Product[]; meta: PaginationMetaDto }> {
    const { data, total } = await this.productsRepository.findAndCount(
      restaurantId,
      queryDto,
    );

    const { page = 1, limit = 10, sort_by = 'display_order', order = 'ASC' } = queryDto;
    const meta = new PaginationMetaDto(page, limit, total, sort_by, order);

    return { data, meta };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const existingProduct = await this.findOne(id);

    if (dto.category_id) {
      await this.validateCategory(dto.category_id, existingProduct.restaurant_id);
    }

    let new_image_url: string | null = null;
    if (dto.image) {
      new_image_url = await this.uploadProductImage(dto.image);
      if (existingProduct.image_url) {
        await this.cloudinaryService.deleteImage(existingProduct.image_url);
      }
    }

    try {
      const { image, price, ...updateData } = dto;
      const updatedFields: Partial<Product> = { ...updateData } as any;
      if (price !== undefined) updatedFields.price = price.toString();
      if (new_image_url) updatedFields.image_url = new_image_url;
      updatedFields.updated_at = new Date();

      return await this.productsRepository.update(id, updatedFields);
    } catch (error) {
      if (new_image_url) await this.cloudinaryService.deleteImage(new_image_url);
      if (error.code === '23514') {
        throw new BadRequestException('El precio debe ser mayor o igual a 0');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    if (product.image_url) {
      await this.cloudinaryService.deleteImage(product.image_url);
    }
    await this.productsRepository.delete(id);
  }

  async softRemove(id: string): Promise<Product> {
    return this.productsRepository.update(id, { is_available: false });
  }

  async reorder(
    restaurantId: string,
    updates: Array<{ id: string; display_order: number }>,
  ): Promise<void> {
    await this.productsRepository.reorderBulk(restaurantId, updates);
  }

  private async validateCategory(categoryId: string, restaurantId: string): Promise<void> {
    const isValid = await this.productsRepository.isCategoryValidForRestaurant(categoryId, restaurantId);
    if (!isValid) {
      throw new NotFoundException(
        `Categoría con ID ${categoryId} no encontrada o no pertenece al restaurante`,
      );
    }
  }

  private async uploadProductImage(base64: string): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImage(base64, 'products');
      return result.secure_url;
    } catch (error) {
      throw new BadRequestException(`Error al subir imagen: ${error.message}`);
    }
  }
}