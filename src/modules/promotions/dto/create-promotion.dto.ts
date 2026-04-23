import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
  IsDateString,
  ValidateIf,
} from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum PromotionAppliesTo {
  PRODUCT = 'product',
  CATEGORY = 'category',
  COMBO = 'combo',
  BRANCH = 'branch',
}

export class CreatePromotionDto {
  @ApiProperty({ description: 'Nombre de la promoción', example: 'Happy Hour' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción detallada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType, description: 'Tipo de descuento' })
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @ApiProperty({ description: 'Valor del descuento', example: 10.50 })
  @IsNumber()
  @Min(0)
  @ValidateIf((o) => o.discount_type === DiscountType.PERCENTAGE)
  @Max(100, { message: 'El valor porcentual no puede exceder 100%' })
  discount_value: number;

  @ApiProperty({ enum: PromotionAppliesTo, description: 'A qué aplica la promoción' })
  @IsEnum(PromotionAppliesTo)
  applies_to: PromotionAppliesTo;

  @ApiPropertyOptional({ description: 'ID del recurso afectado (excepto si aplica a branch)' })
  @ValidateIf((o) => o.applies_to !== PromotionAppliesTo.BRANCH)
  @IsNotEmpty()
  @IsUUID()
  target_id?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio (ISO)', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin (ISO)', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}
