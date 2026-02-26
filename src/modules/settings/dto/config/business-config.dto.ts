import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class BusinessHoursDto {
  @IsOptional()
  @ValidateIf((o) => o.open !== undefined)
  @IsString()
  @MaxLength(5)
  @ApiProperty({
    description: 'Opening time in HH:mm format',
    example: '09:00',
  })
  open?: string;

  @IsOptional()
  @ValidateIf((o) => o.close !== undefined)
  @IsString()
  @MaxLength(5)
  @ApiProperty({
    description: 'Closing time in HH:mm format',
    example: '22:00',
  })
  close?: string;

  @IsOptional()
  @ValidateIf((o) => o.closed !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Is the restaurant closed on this day',
    example: false,
  })
  closed?: boolean;
}

export class DeliveryZoneDto {
  @IsOptional()
  @ValidateIf((o) => o.name !== undefined)
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    description: 'Zone name',
    example: 'Miraflores',
  })
  name?: string;

  @IsOptional()
  @ValidateIf((o) => o.fee !== undefined)
  @IsNumber()
  @Min(0)
  @ApiProperty({
    description: 'Delivery fee for this zone',
    example: 5.0,
  })
  fee?: number;
}

export class SocialMediaDto {
  @IsOptional()
  @ValidateIf((o) => o.facebook !== undefined)
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: 'Facebook URL',
    example: 'https://facebook.com/mirestaurante',
  })
  facebook?: string;

  @IsOptional()
  @ValidateIf((o) => o.instagram !== undefined)
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: 'Instagram handle or URL',
    example: '@mirestaurante',
  })
  instagram?: string;

  @IsOptional()
  @ValidateIf((o) => o.tiktok !== undefined)
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: 'TikTok handle or URL',
    example: '@mirestaurante',
  })
  tiktok?: string;

  @IsOptional()
  @ValidateIf((o) => o.twitter !== undefined)
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: 'Twitter handle or URL',
    example: '@mirestaurante',
  })
  twitter?: string;
}

export class BusinessConfigDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  @ApiProperty({
    description: 'Business hours for each day of the week',
    example: {
      monday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '10:00', close: '20:00', closed: false },
    },
    type: 'object',
    additionalProperties: true,
  })
  business_hours?: Record<string, BusinessHoursDto>;

  @IsOptional()
  @ValidateIf((o) => o.timezone !== undefined)
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    description: 'Timezone',
    example: 'America/Lima',
  })
  timezone?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DeliveryZoneDto)
  @ApiProperty({
    description: 'Delivery zones with fees',
    type: [DeliveryZoneDto],
  })
  delivery_zones?: DeliveryZoneDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  @ApiProperty({
    description: 'Social media links',
    type: SocialMediaDto,
  })
  social_media?: SocialMediaDto;
}
