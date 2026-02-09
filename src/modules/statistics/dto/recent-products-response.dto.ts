import { ApiProperty } from '@nestjs/swagger';

export class RecentProductDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Product UUID identifier'
  })
  id: string;

  @ApiProperty({ 
    example: 'Café Americano',
    description: 'Product name'
  })
  name: string;

  @ApiProperty({ 
    example: 12.50,
    description: 'Product price'
  })
  price: number;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Category UUID identifier'
  })
  category_id: string;

  @ApiProperty({ 
    example: '2024-02-08T22:00:00Z',
    description: 'Product creation date'
  })
  created_at: string;
}

export class RecentProductsResponseDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Restaurant UUID identifier'
  })
  restaurant_id: string;

  @ApiProperty({ 
    type: [RecentProductDto],
    description: 'List of recent products'
  })
  products: RecentProductDto[];
}
