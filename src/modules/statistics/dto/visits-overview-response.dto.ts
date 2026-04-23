import { ApiProperty } from '@nestjs/swagger';

export class VisitBreakdownDto {
  @ApiProperty({ example: 'view' })
  type: string;

  @ApiProperty({ example: 450 })
  count: number;
}

export class VisitsOverviewResponseDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Branch UUID identifier'
  })
  branch_id: string;

  @ApiProperty({ 
    example: 1205,
    description: 'Total number of visits for the branch'
  })
  total_visits: number;

  @ApiProperty({ 
    type: [VisitBreakdownDto],
    description: 'Breakdown of visits by type'
  })
  breakdown: VisitBreakdownDto[];
}
