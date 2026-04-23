import { ApiProperty } from '@nestjs/swagger';
import { DiscountType, PromotionAppliesTo } from './create-promotion.dto';

export class PromotionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  branch_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty({ enum: DiscountType })
  discount_type: DiscountType;

  @ApiProperty()
  discount_value: number;

  @ApiProperty({ enum: PromotionAppliesTo })
  applies_to: PromotionAppliesTo;

  @ApiProperty({ required: false, nullable: true })
  target_id: string | null;

  @ApiProperty({ required: false, nullable: true })
  target_name?: string | null;

  @ApiProperty({ required: false, nullable: true })
  start_date: Date | null;

  @ApiProperty({ required: false, nullable: true })
  end_date: Date | null;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
