import {
  IsString,
  IsUUID,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsUrl,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsUUID()
  @ApiProperty()
  restaurant_id: string;

  @IsUUID()
  @ApiProperty()
  category_id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({ example: 'Café Americano' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Café de origen peruano', required: false })
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ApiProperty({ example: 12.50, minimum: 0 })
  price: number;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ example: 'https://cloudinary.com/image.jpg', required: false })
  image_url?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ default: true })
  is_available?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiProperty({ default: 0 })
  display_order?: number;
}


export class QueryProductDto {
  @IsUUID()
  @ApiProperty()
  restaurant_id: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ required: false })
  category_id?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @ApiProperty({ required: false })
  is_available?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @ApiProperty({ required: false, minimum: 0 })
  min_price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @ApiProperty({ required: false, minimum: 0 })
  max_price?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ default: 1 })
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ default: 10 })
  limit?: number = 10;

  @IsString()
  @IsOptional()
  @ApiProperty({ default: 'display_order', enum: ['display_order', 'name', 'price', 'created_at'] })
  sort_by?: string = 'display_order';

  @IsString()
  @IsOptional()
  @ApiProperty({ default: 'ASC', enum: ['ASC', 'DESC'] })
  order?: 'ASC' | 'DESC' = 'ASC';
}
