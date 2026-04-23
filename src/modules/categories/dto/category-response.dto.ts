import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'uuid-category' })
  id: string;

  @ApiProperty({ example: 'uuid-menu' })
  menu_id: string;

  @ApiProperty({ example: 'uuid-branch', description: 'Sucursal a la que pertenece este menú' })
  branch_id: string;

  @ApiProperty({ example: 'Bebidas Calientes' })
  name: string;

  @ApiPropertyOptional({ example: 'Café, té y chocolate' })
  description?: string;

  @ApiProperty({ example: 1 })
  display_order: number;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2026-02-10T01:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2026-02-10T01:00:00.000Z' })
  updated_at: string;

  @ApiPropertyOptional({ example: 'uuid-category-type' })
  type_id?: string;

  @ApiPropertyOptional({ example: 'Sección del menú 1' })
  type_name?: string;
}
