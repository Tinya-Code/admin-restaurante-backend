import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class DisplayColorsDto {
  @IsOptional()
  @ValidateIf((o) => o.primary !== undefined)
  @IsString()
  @MaxLength(7)
  @ApiProperty({
    description: 'Primary color in hex format',
    example: '#FF6B6B',
  })
  primary?: string;

  @IsOptional()
  @ValidateIf((o) => o.secondary !== undefined)
  @IsString()
  @MaxLength(7)
  @ApiProperty({
    description: 'Secondary color in hex format',
    example: '#4ECDC4',
  })
  secondary?: string;
}

export class DisplayConfigDto {
  @IsOptional()
  @ValidateIf((o) => o.show_images !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Show product images',
    example: true,
    default: true,
  })
  show_images?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.show_descriptions !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Show product descriptions',
    example: true,
    default: true,
  })
  show_descriptions?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.show_categories !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Show categories',
    example: true,
    default: true,
  })
  show_categories?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.currency !== undefined)
  @IsString()
  @MaxLength(3)
  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'PEN',
  })
  currency?: string;

  @IsOptional()
  @ValidateIf((o) => o.currency_symbol !== undefined)
  @IsString()
  @MaxLength(5)
  @ApiProperty({
    description: 'Currency symbol',
    example: 'S/',
  })
  currency_symbol?: string;

  @IsOptional()
  @ValidateIf((o) => o.theme !== undefined)
  @IsEnum(['light', 'dark', 'auto'])
  @ApiProperty({
    description: 'Theme mode',
    example: 'light',
    enum: ['light', 'dark', 'auto'],
  })
  theme?: 'light' | 'dark' | 'auto';

  @IsOptional()
  @ValidateNested()
  @Type(() => DisplayColorsDto)
  @ApiProperty({
    description: 'Color configuration',
    type: DisplayColorsDto,
  })
  colors?: DisplayColorsDto;

  @IsOptional()
  @ValidateIf((o) => o.language !== undefined)
  @IsString()
  @MaxLength(10)
  @ApiProperty({
    description: 'Language code',
    example: 'es',
  })
  language?: string;

  @IsOptional()
  @ValidateIf((o) => o.show_availability_badge !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Show availability badge',
    example: true,
    default: true,
  })
  show_availability_badge?: boolean;
}
