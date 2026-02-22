import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class UpdateRestaurantSettingsDto {
  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {},
    description: 'WhatsApp configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  whatsapp_config?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {},
    description: 'Display configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  display_config?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {},
    description: 'Order configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  order_config?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {},
    description: 'Business configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  business_config?: Record<string, any>;
}
