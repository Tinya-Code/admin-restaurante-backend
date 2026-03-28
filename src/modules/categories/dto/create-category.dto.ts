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
  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ example: 'uuid-menu' })
  menu_id?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({ example: 'Bebidas Calientes' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Café, té y chocolate', required: false })
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({ default: 0 })
  display_order?: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ default: true })
  is_active?: boolean;
}
