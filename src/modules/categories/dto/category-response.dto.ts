import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'uuid-category' })
  id: string;

  @ApiProperty({ example: 'uuid-restaurant' })
  restaurant_id: string;

  @ApiProperty({ example: 'Bebidas Calientes' })
  name: string;

  @ApiProperty({ example: 'Descripción' })
  description?: string;

  @ApiProperty({ example: null })
  menu_id?: string | null;

  @ApiProperty({ example: 1 })
  display_order: number;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2026-02-10T01:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2026-02-10T01:00:00.000Z' })
  updated_at: string;
}
