import { ApiProperty } from '@nestjs/swagger';

export class RestaurantSettingsResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Restaurant UUID identifier',
  })
  restaurant_id: string;

  @ApiProperty({
    example: {},
    description: 'WhatsApp configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  whatsapp_config: Record<string, any>;

  @ApiProperty({
    example: {},
    description: 'Display configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  display_config: Record<string, any>;

  @ApiProperty({
    example: {},
    description: 'Order configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  order_config: Record<string, any>;

  @ApiProperty({
    example: {},
    description: 'Business configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  business_config: Record<string, any>;

  @ApiProperty({
    example: '2024-02-21T15:06:00.000Z',
    description: 'Settings creation timestamp',
  })
  created_at: string;

  @ApiProperty({
    example: '2024-02-21T15:06:00.000Z',
    description: 'Settings last update timestamp',
  })
  updated_at: string;
}
