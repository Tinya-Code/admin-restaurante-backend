import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateComboDto } from './create-combo.dto';

export class UpdateComboDto extends PartialType(CreateComboDto) {
  @ApiPropertyOptional({ description: 'Indica si el combo está activo', example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
