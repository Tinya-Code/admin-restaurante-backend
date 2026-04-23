import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBannerDto {
  @ApiPropertyOptional({
    description: 'Description for the banner',
    example: 'Updated seasonal offer',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Order in which the banner is displayed',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  display_order?: number;

  @ApiPropertyOptional({
    description: 'Whether the banner is active or not',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'URL to redirect to when banner is clicked',
    example: 'https://example.com/offer',
  })
  @IsOptional()
  @IsString()
  link_url?: string;
}
