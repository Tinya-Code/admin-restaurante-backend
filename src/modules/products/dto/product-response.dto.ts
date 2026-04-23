import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: '9c0b1132-c388-445d-8e47-08afe12a10ce', description: 'ID del producto' })
  id: string;

  @ApiProperty({ example: '5a53d32f-834d-43df-a9ed-5db9b6badef9', description: 'ID de la sucursal' })
  branch_id: string;

  @ApiProperty({ example: '239f1742-fc12-4f17-bf2a-bd955890582b', description: 'ID de la categoría' })
  category_id: string;

  @ApiProperty({ example: 'Café Americano', description: 'Nombre del producto' })
  name: string;

  @ApiProperty({ example: 'Café de origen peruano', description: 'Descripción', nullable: true })
  description: string | null;

  @ApiProperty({ example: '12.50', description: 'Precio del producto' })
  price: string;

  @ApiProperty({ example: 'https://cloudinary.com/image.jpg', description: 'URL de la imagen del producto', nullable: true })
  image_url: string | null;

  @ApiProperty({ example: 'products/v1243123/image_abc', description: 'ID de Cloudinary', nullable: true })
  cloudinary_id: string | null;

  @ApiProperty({ example: true, description: 'Disponibilidad del producto' })
  is_available: boolean;

  @ApiProperty({ example: false, description: 'Es recomendado' })
  is_recommended: boolean;

  @ApiProperty({ example: '2026-02-09T10:30:00.000Z', description: 'Fecha de creación' })
  created_at: Date;

  @ApiProperty({ example: '2026-02-09T10:30:00.000Z', description: 'Fecha de actualización' })
  updated_at: Date;

  @ApiProperty({ example: 'Bebidas Calientes', description: 'Nombre de la categoría (JOIN)', required: false })
  category_name?: string;
}
