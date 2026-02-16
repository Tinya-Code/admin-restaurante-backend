import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsBoolean,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryProductDto {
  @IsUUID()
  @ApiProperty({
    description: 'ID del restaurante (requerido)',
    example: '5a53d32f-834d-43df-a9ed-5db9b6badef9',
  })
  restaurant_id: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filtrar por categoría específica',
    example: '239f1742-fc12-4f17-bf2a-bd955890582b',
  })
  category_id?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @ApiPropertyOptional({
    description: 'Filtrar por disponibilidad',
    example: true,
    type: Boolean,
  })
  is_available?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @ApiPropertyOptional({
    description: 'Precio mínimo para filtrar',
    minimum: 0,
    example: 10,
    type: Number,
  })
  min_price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @ApiPropertyOptional({
    description: 'Precio máximo para filtrar',
    minimum: 0,
    example: 50,
    type: Number,
  })
  max_price?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : 1))
  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    minimum: 1,
    example: 1,
  })
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : 10))
  @ApiPropertyOptional({
    description: 'Elementos por página (máximo 100)',
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  limit?: number = 10;

  @IsString()
  @IsOptional()
  @IsIn(['display_order', 'name', 'price', 'created_at'])
  @ApiPropertyOptional({
    description: 'Campo para ordenar resultados',
    default: 'display_order',
    enum: ['display_order', 'name', 'price', 'created_at'],
    example: 'display_order',
  })
  sort_by?: string = 'display_order';

  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    default: 'ASC',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  order?: 'ASC' | 'DESC' = 'ASC';
}