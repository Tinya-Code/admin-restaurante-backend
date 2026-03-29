import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Type } from 'class-transformer';

export enum SearchType {
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  ALL = 'all',
}

export class QuerySearchDto {
  @ApiProperty({
    description: 'Término de búsqueda para encontrar productos o categorías por nombre',
    example: 'café',
  })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({
    description: 'ID del menú opcional para acotar la búsqueda',
    example: 'e61d4b41-4813-4be1-93db-79373f563580',
  })
  @IsOptional()
  @IsString()
  menu_id?: string;

  @ApiPropertyOptional({
    description: 'Tipo de elementos a buscar (products, categories, o all)',
    enum: SearchType,
    example: SearchType.ALL,
    default: SearchType.ALL,
  })
  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;

  @ApiPropertyOptional({
    description: 'Página actual para la paginación',
    example: 1,
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    example: 10,
    default: 10,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
