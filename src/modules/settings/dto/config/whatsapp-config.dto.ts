import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class WhatsAppConfigDto {
  @IsOptional()
  @ValidateIf((o) => o.enabled !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Enable WhatsApp integration',
    example: true,
    default: false,
  })
  enabled?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.number !== undefined)
  @IsString()
  @MaxLength(20)
  @ApiProperty({
    description: 'WhatsApp phone number with country code',
    example: '+51987654321',
  })
  number?: string;

  @IsOptional()
  @ValidateIf((o) => o.message_template !== undefined)
  @IsString()
  @MaxLength(500)
  @ApiProperty({
    description: 'Message template for orders',
    example: 'Hola, me gustaría ordenar: {{products}}',
  })
  message_template?: string;

  @IsOptional()
  @ValidateIf((o) => o.show_prices !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Show prices in WhatsApp messages',
    example: true,
    default: true,
  })
  show_prices?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.greeting !== undefined)
  @IsString()
  @MaxLength(200)
  @ApiProperty({
    description: 'Greeting message for WhatsApp',
    example: '¡Bienvenido a nuestro menú!',
  })
  greeting?: string;

  @IsOptional()
  @ValidateIf((o) => o.auto_include_restaurant_name !== undefined)
  @IsBoolean()
  @ApiProperty({
    description: 'Auto include restaurant name in messages',
    example: true,
    default: true,
  })
  auto_include_restaurant_name?: boolean;
}
