import {
  IsUUID,
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  // menu_id es inyectado por el RestaurantMemberGuard via @CurrentMenu(),
  // no debe enviarse en el body para evitar cruces de datos multi-tenant.

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({ example: 'Bebidas Calientes' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Café, té y chocolate' })
  description?: string;

  @IsInt()
  @Min(0)
  @Max(9999)
  @IsOptional()
  @ApiPropertyOptional({ default: 0 })
  display_order?: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ default: true })
  is_active?: boolean;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ example: 'uuid-category-type' })
  type_id?: string;
}
