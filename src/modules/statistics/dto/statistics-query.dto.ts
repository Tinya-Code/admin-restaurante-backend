import { IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class StatisticsQueryDto {
  @IsUUID()
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Restaurant UUID identifier'
  })
  restaurant_id: string;

  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ 
    default: 5, 
    minimum: 1, 
    maximum: 20,
    required: false,
    description: 'Limit for recent products endpoint'
  })
  limit?: number = 5;
}
