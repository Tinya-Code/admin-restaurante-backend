import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './entities/product.entity';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto/pagination-meta.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(branchId: string, dto: CreateProductDto): Promise<Product> {
    // Pre-verificación del límite antes del INSERT para dar feedback inmediato
    const isWithinLimit = await this.productsRepository.isWithinProductLimit(branchId);
    if (!isWithinLimit) {
      throw new ForbiddenException(
        'Has alcanzado el límite de productos de tu plan actual. Actualiza tu plan para añadir más.',
      );
    }

    await this.validateCategoryForBranch(dto.category_id, branchId);

    // DESHABILITADO TEMPORALMENTE: Se manejarán imágenes en el futuro
    let image_url: string | null = null;
    /*
    if (dto.image) {
      image_url = await this.uploadProductImage(dto.image);
    }
    */

    try {
      const { image, price, ...productData } = dto;
      const payload: Partial<Product> = {
        ...productData,
        price: price?.toString(),
        // image_url, // No guardar image_url por ahora
      };
      return await this.productsRepository.create(payload);
    } catch (err: any) {
      /*
      if (image_url) await this.cloudinaryService.deleteImage(image_url);
      */
      // Segunda línea de defensa: el trigger trg_check_product_limit puede
      // rechazar el INSERT si la pre-verificación fue eludida
      if (err?.message?.startsWith('PLAN_LIMIT_EXCEEDED:')) {
        throw new ForbiddenException(
          err.message.replace('PLAN_LIMIT_EXCEEDED: ', ''),
        );
      }
      if (err.code === '23514') {
        throw new BadRequestException('El precio debe ser mayor o igual a 0');
      }
      throw err;
    }
  }

  async findAll(
    branchId: string,
    queryDto: QueryProductDto,
  ): Promise<{ data: Product[]; meta: PaginationMetaDto }> {
    const { data, total } = await this.productsRepository.findAndCount(
      branchId,
      queryDto,
    );

    const { page = 1, limit = 10, sort_by = 'name', order = 'ASC' } = queryDto;
    const meta = new PaginationMetaDto(page, limit, total, sort_by, order);

    return { data, meta };
  }

  async findOne(branchId: string, id: string): Promise<Product> {
    const product = await this.productsRepository.findByIdAndBranch(id, branchId);
    if (!product) {
      throw new NotFoundException(
        `Producto con ID ${id} no encontrado en esta sucursal.`,
      );
    }
    return product;
  }

  async update(
    branchId: string,
    id: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    await this.findOne(branchId, id);

    if (dto.category_id) {
      await this.validateCategoryForBranch(dto.category_id, branchId);
    }

    // DESHABILITADO TEMPORALMENTE: Se manejarán imágenes en el futuro
    let new_image_url: string | null = null;
    /*
    if (dto.image) {
      new_image_url = await this.uploadProductImage(dto.image);
      if (existingProduct.image_url) {
        await this.cloudinaryService.deleteImage(existingProduct.image_url);
      }
    }
    */

    try {
      const { image, price, ...updateData } = dto;
      const updatedFields: Partial<Product> = { ...updateData } as any;
      if (price !== undefined) updatedFields.price = price.toString();
      // if (new_image_url) updatedFields.image_url = new_image_url;
      updatedFields.updated_at = new Date();

      return await this.productsRepository.update(id, updatedFields);
    } catch (err: any) {
      /*
      if (new_image_url) await this.cloudinaryService.deleteImage(new_image_url);
      */
      if (err.code === '23514') {
        throw new BadRequestException('El precio debe ser mayor o igual a 0');
      }
      throw err;
    }
  }

  async remove(branchId: string, id: string): Promise<void> {
    const product = await this.findOne(branchId, id);
    if (product.image_url) {
      await this.cloudinaryService.deleteImage(product.image_url);
    }
    await this.productsRepository.delete(id);
  }

  async softRemove(branchId: string, id: string): Promise<Product> {
    await this.findOne(branchId, id);
    return this.productsRepository.update(id, { is_available: false });
  }

  /**
   * Verifica que la categoría pertenece a la sucursal activa (via menu_id).
   * Impide crear o mover productos a categorías de otras sucursales.
   */
  private async validateCategoryForBranch(
    categoryId: string,
    branchId: string,
  ): Promise<void> {
    const isValid = await this.productsRepository.isCategoryValidForBranch(
      categoryId,
      branchId,
    );
    if (!isValid) {
      throw new NotFoundException(
        `Categoría con ID ${categoryId} no encontrada o no pertenece a esta sucursal.`,
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