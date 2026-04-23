import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsBoolean,
  IsInt,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDto {
  // menu_id fue eliminado intencionalmente: mover una categoría a otro menú
  // desde el cliente puede cruzar datos entre restaurantes o sucursales distintas.
  // Si se necesita reubicar una categoría, debe hacerse con un endpoint dedicado
  // que valide el contexto multi-tenant correctamente.

  @ApiPropertyOptional({ example: 'Bebidas Calientes', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Descripción nueva' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  @Type(() => Number)
  display_order?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

  @ApiPropertyOptional({ example: 'uuid-category-type' })
  @IsOptional()
  @IsUUID()
  type_id?: string;
}
