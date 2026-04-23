import { ApiProperty } from '@nestjs/swagger';

export class CombosCountResponseDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Branch UUID identifier'
  })
  branch_id: string;

  @ApiProperty({ 
    example: 8,
    description: 'Total number of combos for the branch'
  })
  total_combos: number;
}
