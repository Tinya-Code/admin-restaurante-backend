import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePromotionDto } from './create-promotion.dto';

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {
  @ApiPropertyOptional({ description: 'Indica si la promoción está activa', example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
