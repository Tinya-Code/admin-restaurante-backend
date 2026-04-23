import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ComboProductDto {
  @ApiProperty({ description: 'ID del producto a incluir en el combo' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'Cantidad de este producto en el combo', example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateComboDto {
  @ApiProperty({ description: 'Nombre del combo', example: 'Dúo Power' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción detallada del combo' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Precio del combo', example: 45.50 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Imagen del combo en formato Base64',
    example: 'data:image/png;base64,...',
  })
  @IsOptional()
  @IsString()
  image_base64?: string;

  @ApiPropertyOptional({ description: 'Orden de visualización', example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  display_order?: number;

  @ApiProperty({
    description: 'Lista de productos que componen el combo',
    type: [ComboProductDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboProductDto)
  products: ComboProductDto[];
}
