import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsString()

  @IsOptional()
  @MinLength(2, { message: 'La búsqueda debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'La búsqueda no puede exceder 100 caracteres' })
  @Type(() => String)
  searchword: string; // Palabra a buscar

  @IsOptional()
  @IsString()
  @MinLength(4, { message: 'El ID de la tienda debe tener al menos 4 caracteres' })
  @MaxLength(36, { message: 'El ID de la tienda no puede exceder 36 caracteres' })
  userUuid?: string; // UUID de la tienda

  @IsOptional()
  @IsString()
  categoria?: string; // Categoría del producto

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1; // Número de página

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10; // Límite de resultados
}
