import { IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class StatisticsQueryDto {
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
