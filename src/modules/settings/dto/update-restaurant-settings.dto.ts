import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { BusinessConfigDto } from './config/business-config.dto';
import { DisplayConfigDto } from './config/display-config.dto';
import { OrderConfigDto } from './config/order-config.dto';
import { WhatsAppConfigDto } from './config/whatsapp-config.dto';

export class UpdateRestaurantSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppConfigDto)
  @ApiProperty({
    description: 'WhatsApp configuration settings',
    type: WhatsAppConfigDto,
  })
  whatsapp_config?: WhatsAppConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DisplayConfigDto)
  @ApiProperty({
    description: 'Display configuration settings',
    type: DisplayConfigDto,
  })
  display_config?: DisplayConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderConfigDto)
  @ApiProperty({
    description: 'Order configuration settings',
    type: OrderConfigDto,
  })
  order_config?: OrderConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessConfigDto)
  @ApiProperty({
    description: 'Business configuration settings',
    type: BusinessConfigDto,
  })
  business_config?: BusinessConfigDto;
}
