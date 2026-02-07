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
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsUUID()
  @ApiProperty({ example: 'uuid-restaurant' })
  restaurant_id: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ example: 'uuid-menu', required: false })
  menu_id?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({ example: 'Bebidas Calientes' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Café, té y chocolate', required: false })
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiProperty({ default: 0 })
  display_order?: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ default: true })
  is_active?: boolean;
}
export class QueryCategoryDto {
  @IsUUID()
  @ApiProperty({ example: 'uuid-restaurant' })
  restaurant_id: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ required: false })
  menu_id?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @ApiProperty({ required: false })
  is_active?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ default: 1, minimum: 1 })
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ default: 10, minimum: 1, maximum: 100 })
  limit?: number = 10;

  @IsString()
  @IsOptional()
  @ApiProperty({ default: 'display_order', enum: ['display_order', 'name', 'created_at'] })
  sort_by?: string = 'display_order';

  @IsString()
  @IsOptional()
  @ApiProperty({ default: 'ASC', enum: ['ASC', 'DESC'] })
  order?: 'ASC' | 'DESC' = 'ASC';
}