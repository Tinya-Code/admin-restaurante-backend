import { ApiProperty } from '@nestjs/swagger';

export class ProductsCountResponseDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Branch UUID identifier'
  })
  branch_id: string;

  @ApiProperty({ 
    example: 45,
    description: 'Total number of products for the branch'
  })
  total_products: number;
}
