import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad Product
 * Representa un producto en el menú de un restaurante
 */
export class Product {
  @ApiProperty({
    description: 'ID único del producto (UUID)',
    example: '9c0b1132-c388-445d-8e47-08afe12a10ce',
  })
  id: string;

  @ApiProperty({
    description: 'ID del restaurante al que pertenece el producto',
    example: '5a53d32f-834d-43df-a9ed-5db9b6badef9',
  })
  restaurant_id: string;

  @ApiProperty({
    description: 'ID de la categoría del producto',
    example: '239f1742-fc12-4f17-bf2a-bd955890582b',
  })
  category_id: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Café Americano',
    maxLength: 255,
  })
  name: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Café de origen peruano, tostado medio',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Precio del producto (viene como string desde PostgreSQL NUMERIC)',
    example: '12.50',
    type: String,
  })
  price: string;

  @ApiProperty({
    description: 'URL de la imagen del producto',
    example: 'https://cloudinary.com/image.jpg',
    required: false,
    nullable: true,
  })
  image_url?: string | null;

  @ApiProperty({
    description: 'Indica si el producto está disponible para ordenar',
    example: true,
    default: true,
  })
  is_available: boolean;

  @ApiProperty({
    description: 'Orden de visualización del producto en el menú',
    example: 0,
    default: 0,
    minimum: 0,
  })
  display_order: number;

  @ApiProperty({
    description: 'Fecha y hora de creación del producto',
    example: '2026-02-09T10:30:00.000Z',
    type: Date,
  })
  created_at: Date;

  @ApiProperty({
    description: 'Fecha y hora de última actualización del producto',
    example: '2026-02-09T10:30:00.000Z',
    type: Date,
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Nombre de la categoría (obtenido por JOIN)',
    example: 'Bebidas Calientes',
    required: false,
  })
  category_name?: string;
}