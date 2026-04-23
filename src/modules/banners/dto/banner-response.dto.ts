import { ApiProperty } from '@nestjs/swagger';

export class BannerResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID del banner' })
  id: string;

  @ApiProperty({ example: 'de9a492f-8a1c-480e-a9ac-e4ee50036de6', description: 'ID de la sucursal' })
  branch_id: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v1234/restaurant/banners/abc123.jpg', description: 'URL pública de la imagen' })
  image_url: string;

  @ApiProperty({ example: 'banners/v1234/abc123', description: 'ID del asset en Cloudinary', nullable: true })
  cloudinary_id: string | null;

  @ApiProperty({ example: 'https://example.com/promotion', description: 'URL de destino al hacer clic', nullable: true })
  link_url: string | null;

  @ApiProperty({ example: 'Oferta de temporada 50% off', description: 'Descripción del banner', nullable: true })
  description: string | null;

  @ApiProperty({ example: 0, description: 'Orden de visualización' })
  display_order: number;

  @ApiProperty({ example: true, description: 'Banner activo' })
  is_active: boolean;

  @ApiProperty({ example: '2026-02-21T15:06:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2026-02-21T15:06:00.000Z' })
  updated_at: string;
}
