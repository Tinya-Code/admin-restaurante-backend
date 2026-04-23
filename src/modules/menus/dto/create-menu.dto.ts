import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Menú Fin de Semana' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Especialidades del sábado y domingo' })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ default: true })
  is_active?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({ default: 0 })
  display_order?: number;
}
