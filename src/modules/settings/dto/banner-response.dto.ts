import { ApiProperty } from '@nestjs/swagger';

export class BannerResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'de9a492f-8a1c-480e-a9ac-e4ee50036de6' })
  restaurant_id: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v1234/restaurant/banners/abc123.jpg' })
  image_url: string;

  @ApiProperty({ example: 'Seasonal offer 50% off', required: false })
  description?: string;

  @ApiProperty({ example: 0 })
  display_order: number;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2024-02-21T15:06:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2024-02-21T15:06:00.000Z' })
  updated_at: string;
}
