import { ApiProperty } from '@nestjs/swagger';

export class CategoriesCountResponseDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Restaurant UUID identifier'
  })
  restaurant_id: string;

  @ApiProperty({ 
    example: 12,
    description: 'Total number of categories for the restaurant'
  })
  total_categories: number;
}
