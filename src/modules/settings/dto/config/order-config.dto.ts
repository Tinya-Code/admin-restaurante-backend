import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class OrderConfigDto {
  @IsOptional()
  @ValidateIf((o) => o.enabled !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Enable ordering system',
    example: false,
    default: false,
  })
  enabled?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.min_order_amount !== undefined)
  @IsNumber()
  @Min(0)
  @ApiProperty({
    description: 'Minimum order amount',
    example: 15.0,
  })
  min_order_amount?: number;

  @IsOptional()
  @ValidateIf((o) => o.delivery_fee !== undefined)
  @IsNumber()
  @Min(0)
  @ApiProperty({
    description: 'Delivery fee',
    example: 5.0,
  })
  delivery_fee?: number;

  @IsOptional()
  @ValidateIf((o) => o.payment_methods !== undefined)
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'Available payment methods',
    example: ['cash', 'card', 'yape', 'plin'],
    type: [String],
  })
  payment_methods?: string[];

  @IsOptional()
  @ValidateIf((o) => o.accepts_reservations !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Accept reservations',
    example: true,
    default: false,
  })
  accepts_reservations?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.delivery_enabled !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Enable delivery',
    example: true,
    default: false,
  })
  delivery_enabled?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.pickup_enabled !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Enable pickup',
    example: true,
    default: false,
  })
  pickup_enabled?: boolean;
}
