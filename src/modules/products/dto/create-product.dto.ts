import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsInt,
  Matches,
} from 'class-validator';

export class CreateProductDto {
  @IsUUID()
  @ApiProperty({
    description: 'ID de la categoría',
    example: '239f1742-fc12-4f17-bf2a-bd955890582b',
  })
  category_id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Café Americano',
    minLength: 2,
    maxLength: 255,
  })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @ApiPropertyOptional({
    description: 'Descripción del producto',
    example: 'Café de origen peruano, tostado medio',
    maxLength: 1000,
  })
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  @ApiProperty({
    description: 'Precio del producto (debe ser >= 0)',
    example: 12.5,
    minimum: 0,
    type: Number,
  })
  price: number;

  @IsString()
  @IsOptional()
  @Matches(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/, {
    message: 'La imagen debe estar en formato base64 válido',
  })
  @ApiPropertyOptional({
    description: 'Imagen del producto en base64 (data:image/png;base64,...)',
    example: 'data:image/png;base64,iVBORw0KGgo...',
  })
  image?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  @ApiPropertyOptional({
    description: 'Indica si el producto está disponible',
    default: true,
    type: Boolean,
  })
  is_available?: boolean = true;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'Orden de visualización del producto',
    default: 0,
    minimum: 0,
    type: Number,
  })
  display_order?: number = 0;
}