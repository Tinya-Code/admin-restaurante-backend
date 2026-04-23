import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { BusinessConfigDto } from './config/business-config.dto';
import { DisplayConfigDto } from './config/display-config.dto';
import { OrderConfigDto } from './config/order-config.dto';
import { WhatsAppConfigDto } from './config/whatsapp-config.dto';
import { ScheduleDto } from './config/schedule.dto';

export class UpdateBranchSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppConfigDto)
  @ApiProperty({
    description: 'WhatsApp configuration settings (overrides restaurant)',
    type: WhatsAppConfigDto,
  })
  whatsapp_config?: WhatsAppConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DisplayConfigDto)
  @ApiProperty({
    description: 'Display configuration settings (overrides restaurant)',
    type: DisplayConfigDto,
  })
  display_config?: DisplayConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderConfigDto)
  @ApiProperty({
    description: 'Order configuration settings (overrides restaurant)',
    type: OrderConfigDto,
  })
  order_config?: OrderConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessConfigDto)
  @ApiProperty({
    description: 'Business configuration settings (overrides restaurant)',
    type: BusinessConfigDto,
  })
  business_config?: BusinessConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDto)
  @ApiProperty({
    description: 'Branch specific schedule',
    type: ScheduleDto,
  })
  schedule?: ScheduleDto;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'URL pública del logo de la sucursal',
    example: 'https://res.cloudinary.com/demo/image/upload/logo.jpg',
  })
  logo_url?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'ID del asset del logo en Cloudinary (para gestión interna)',
    example: 'branches/v1234/logo_abc',
  })
  logo_cloudinary_id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Descripción de la sucursal',
    example: 'Sucursal principal en Miraflores',
  })
  description?: string;
}
