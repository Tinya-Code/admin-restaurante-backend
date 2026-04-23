import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({
    description: 'Image in Base64 format',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  })
  @IsNotEmpty()
  @IsString()
  image_base64: string;

  @ApiPropertyOptional({
    description: 'Description for the banner',
    example: 'Seasonal offer 50% off',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Order in which the banner is displayed',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  display_order?: number;

  @ApiPropertyOptional({
    description: 'URL to redirect to when banner is clicked',
    example: 'https://example.com/offer',
  })
  @IsOptional()
  @IsString()
  link_url?: string;
}
