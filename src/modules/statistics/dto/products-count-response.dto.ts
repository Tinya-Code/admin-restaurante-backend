import { ApiProperty } from '@nestjs/swagger';

export class ProductsCountResponseDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Restaurant UUID identifier'
  })
  restaurant_id: string;

  @ApiProperty({ 
    example: 45,
    description: 'Total number of products for the restaurant'
  })
  total_products: number;
}
